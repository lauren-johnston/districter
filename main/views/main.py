#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from allauth.account.decorators import verified_email_required
from allauth.account.admin import EmailAddress
from allauth.account.adapter import DefaultAccountAdapter

from django.utils.decorators import method_decorator
from django.forms import formset_factory
from ..forms import (
    CommunityForm,
    DeletionForm,
    AddressForm,
)
from ..models import (
    CommunityEntry,
    WhiteListEntry,
    Membership,
    Organization,
    Address,
    CampaignToken,
    Campaign,
)
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from django.utils.translation import gettext
from django.urls import reverse, reverse_lazy
from django.utils.translation import (
    LANGUAGE_SESSION_KEY,
    check_for_language,
    get_language,
    to_locale,
)
from shapely.geometry import mapping
import geojson
import os
import json
import re
import csv
import hashlib
from django.template import loader
import shapely.wkt
import reverse_geocoder as rg
from state_abbrev import us_state_abbrev
from django.contrib.auth.models import Group
from itertools import islice
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

# ******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import GEOSGeometry


# ******************************************************************************#
# language views

# ******************************************************************************#

"""
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
"""


class Index(TemplateView):
    """
    The main view/home page.
    """

    template_name = "main/index.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(
            **kwargs
        )  # get the default context data

        context["mapbox_key"] = os.environ.get("DISTR_MAPBOX_KEY")
        return context


# ******************************************************************************#


class About(TemplateView):
    template_name = "main/pages/about.html"


# ******************************************************************************#


class Privacy(TemplateView):
    template_name = "main/pages/privacy.html"


# ******************************************************************************#


class Terms(TemplateView):
    template_name = "main/pages/terms.html"


# ******************************************************************************#


class Michigan(TemplateView):
    template_name = "main/michigan.html"


# ******************************************************************************#
class Review(LoginRequiredMixin, TemplateView):
    template_name = "main/review.html"
    form_class = DeletionForm
    initial = {"key": "value"}

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({"user": self.request.user})
        return initial

    def get_context_data(self, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix="")
        # the polygon coordinates
        entryPolyDict = dict()

        user = self.request.user
        approvedList = list()
        # in this case, just get the ones we made
        query = CommunityEntry.objects.filter(user=user)
        for obj in query:
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
        context = {
            "form": form,
            "entry_poly_dict": json.dumps(entryPolyDict),
            "approved": json.dumps(approvedList),
            "communities": query,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return context

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix="")
        # delete entry if form is valid and entry belongs to current user
        query_error = False
        if form.is_valid():
            query = CommunityEntry.objects.filter(user=self.request.user)
            try:
                entry = query.get(entry_ID=request.POST.get("c_id"))
                entry.delete()
            except Exception:
                query_error = True
        context = self.get_context_data()
        context["query_error"] = query_error
        return render(request, self.template_name, context)


# ******************************************************************************#


class Submission(TemplateView):
    template_name = "main/submission.html"
    sha = hashlib.sha256()
    NUM_DIGITS = 10  # TODO move to some place with constants

    def get(self, request, *args, **kwargs):
        m_uuid = self.request.GET.get("map_id", None)
        # TODO: Are there security risks? Probably - we should hash the UUID and make that the permalink

        if m_uuid is None:
            pass  # TODO need to fix here
        query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)

        if len(query) == 0:
            context = {
                "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            }
            return render(request, self.template_name, context)
        # query will have length 1 or database is invalid
        user_map = query[0]
        if (
            user_map.census_blocks_polygon == ""
            or user_map.census_blocks_polygon is None
        ):
            s = "".join(user_map.user_polygon.geojson)
        else:
            s = "".join(user_map.census_blocks_polygon.geojson)
        map_poly = geojson.loads(s)
        entryPolyDict = {}
        entryPolyDict[m_uuid] = map_poly.coordinates

        context = {
            "c": user_map,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        for a in Address.objects.filter(entry=user_map):
            context["street"] = a.street
            context["city"] = a.city + ", " + a.state + " " + a.zipcode
        if self.request.user.is_authenticated:
            if user_map.organization:
                context["is_org_admin"] = self.request.user.is_org_admin(
                    user_map.organization_id
                )
                context[
                    "is_org_moderator"
                ] = self.request.user.is_org_moderator(
                    user_map.organization_id
                )
            context["is_community_author"] = self.request.user == user_map.user
        return render(request, self.template_name, context)


# ******************************************************************************#


class ExportView(TemplateView):
    template = "main/export.html"

    def get(self, request, *args, **kwargs):
        m_uuid = self.request.GET.get("map_id", None)
        if m_uuid:
            query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)
        if not query:
            context = {
                "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            }
            return render(request, self.template_name, context)
        map_geojson = serialize(
            "geojson",
            query,
            geometry_field="census_blocks_polygon",
            fields=(
                "entry_name",
                "cultural_interests",
                "economic_interests",
                "comm_activities",
                "other_considerations",
            ),
        )
        gj = json.loads(map_geojson)
        user_map = query[0]
        if user_map.organization:
            gj["features"][0]["properties"][
                "organization"
            ] = user_map.organization.name
        if user_map.campaign:
            gj["features"][0]["properties"][
                "campaign"
            ] = user_map.campaign.name
        if self.request.user.is_authenticated:
            is_org_leader = user_map.organization and (
                self.request.user.is_org_admin(user_map.organization_id)
                or self.request.user.is_org_moderator(user_map.organization_id)
            )
            if is_org_leader or self.request.user == user_map.user:
                gj["features"][0]["properties"][
                    "author_name"
                ] = user_map.user_name
                for a in Address.objects.filter(entry=user_map):
                    addy = (
                        a.street
                        + " "
                        + a.city
                        + ", "
                        + a.state
                        + " "
                        + a.zipcode
                    )
                    gj["features"][0]["properties"]["address"] = addy

        response = HttpResponse(
            json.dumps(gj), content_type="application/json"
        )
        return response


# ******************************************************************************#


class Map(TemplateView):
    template_name = "main/map.html"

    def get_context_data(self, **kwargs):

        # the polygon coordinates
        entryPolyDict = dict()
        # all communities for display TODO: might need to limit this? or go by state
        query = CommunityEntry.objects.all()
        # get the polygon from db and pass it on to html
        for obj in CommunityEntry.objects.all():
            if not obj.admin_approved:
                continue
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "communities": query,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return context


# ******************************************************************************#


class Thanks(LoginRequiredMixin, TemplateView):
    template_name = "main/thanks.html"

    # @method_decorator(login_required())
    def get_context_data(self, **kwargs):
        if EmailAddress.objects.filter(
            user=self.request.user, verified=True
        ).exists():
            context = super().get_context_data(**kwargs)
            has_campaign = False
            organization_name = ""
            campaign_name = ""
            if kwargs["campaign"]:
                has_campaign = True
                campaign_slug = self.kwargs["campaign"]
                campaign = Campaign.objects.get(slug=campaign_slug)
                campaign_name = campaign.name
                organization = campaign.organization
                organization_name = organization.name

            context["verified"] = True
            context["map_url"] = self.kwargs["map_id"]
            context["campaign"] = self.kwargs["campaign"]
            context["has_campaign"] = has_campaign
            context["organization_name"] = organization_name
            context["campaign_name"] = campaign_name
            return context
        else:
            # email = EmailAddress.objects.get(user=self.request.user)
            # DefaultAccountAdapter.send_confirmation_mail(self, email, None, False)
            context = super().get_context_data(**kwargs)

            context["verified"] = False
            context["map_url"] = self.kwargs["map_id"]
            context["campaign"] = self.kwargs["campaign"]
            context["has_campaign"] = False
            context["organization_name"] = "TESTING"
            context["campaign_name"] = "TESTING"
            return context


# ******************************************************************************#


class EntryView(LoginRequiredMixin, View):
    """
    EntryView displays the form and map selection screen.
    """

    template_name = "main/entry.html"
    community_form_class = CommunityForm
    address_form_class = AddressForm
    # form_class = CommunityForm
    initial = {
        "key": "value",
    }
    success_url = "/thanks/"

    data = {
        "form-TOTAL_FORMS": "1",
        "form-INITIAL_FORMS": "0",
        "form-MAX_NUM_FORMS": "10",
    }

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({"user": self.request.user})
        return initial

    def get(self, request, *args, **kwargs):
        comm_form = self.community_form_class(
            initial=self.get_initial(), label_suffix=""
        )
        addr_form = self.address_form_class(
            initial=self.get_initial(), label_suffix=""
        )

        has_token = False
        if kwargs["token"]:
            has_token = True

        has_campaign = False
        organization_name = ""
        organization_id = None
        campaign_name = ""
        campaign_id = None
        if kwargs["campaign"]:
            has_campaign = True
            campaign_slug = self.kwargs["campaign"]
            campaign = Campaign.objects.get(slug=campaign_slug)
            campaign_name = campaign.name
            campaign_id = campaign.id
            organization = campaign.organization
            organization_name = organization.name
            organization_id = organization.id

        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "has_token": has_token,
            "has_campaign": has_campaign,
            "organization_name": organization_name,
            "organization_id": organization_id,
            "campaign_name": campaign_name,
            "campaign_id": campaign_id,
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        comm_form = self.community_form_class(request.POST, label_suffix="")
        addr_form = self.address_form_class(request.POST, label_suffix="")
        if comm_form.is_valid():
            entryForm = comm_form.save(commit=False)

            # This returns an array of Django GEOS Polygon types
            polyArray = comm_form.data["census_blocks_polygon_array"]

            if polyArray is not None and polyArray != "":
                polyArray = polyArray.split("|")
                newPolyArr = []
                # union them one at a time- does not work

                for stringPolygon in polyArray:
                    new_poly = GEOSGeometry(stringPolygon, srid=4326)
                    newPolyArr.append(new_poly)

                mpoly = MultiPolygon(newPolyArr)
                polygonUnion = mpoly.unary_union
                polygonUnion.normalize()
                # if one polygon is returned, create a multipolygon
                if polygonUnion.geom_typeid == 3:
                    polygonUnion = MultiPolygon(polygonUnion)

                entryForm.census_blocks_polygon = polygonUnion

            if self.kwargs["campaign"]:
                campaign = Campaign.objects.get(slug=self.kwargs["campaign"])
                if campaign:
                    entryForm.campaign = campaign
                    entryForm.organization = campaign.organization

            if entryForm.organization:
                if self.request.user.is_member(entryForm.organization.id):
                    entryForm.admin_approved = True
                else:
                    # check if user is on the whitelist
                    whitelist_entry = WhiteListEntry.objects.filter(
                        organization=entryForm.organization.id,
                        email=self.request.user.email,
                    )
                    if whitelist_entry:
                        # add user to membership
                        member = Membership(
                            member=self.request.user,
                            organization=entryForm.organization,
                            is_whitelisted=True,
                        )
                        member.save()

                        # approve this entry
                        entryForm.admin_approved = True

            # TODO: Determine role of campaign tokens (one time link, etc.)
            # if self.kwargs["token"]:
            #     token = CampaignToken.objects.get(token=self.kwargs["token"])
            #     if token:
            #         entryForm.campaign = token.campaign
            #         entryForm.organization = token.campaign.organization

            #         # if user has a token and campaign is active, auto approve submission
            #         if token.campaign.is_active:
            #             entryForm.admin_approved = True

            entryForm.save()
            if addr_form.is_valid():
                addrForm = addr_form.save(commit=False)
                addrForm.entry = entryForm
                addrForm.save()

            m_uuid = str(entryForm.entry_ID).split("-")[0]
            if not entryForm.campaign:
                self.success_url = reverse_lazy(
                    "main:thanks", kwargs={"map_id": m_uuid}
                )
            else:
                self.success_url = reverse_lazy(
                    "main:thanks",
                    kwargs={
                        "map_id": m_uuid,
                        "slug": entryForm.organization.slug,
                        "campaign": entryForm.campaign.slug,
                    },
                )
            return HttpResponseRedirect(self.success_url)
        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return render(request, self.template_name, context)
