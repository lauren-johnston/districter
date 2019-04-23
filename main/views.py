from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.generic import TemplateView, ListView
from django.views import View
from django.shortcuts import redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from allauth.account.decorators import verified_email_required
from django.forms import formset_factory
# from .models import Entry
from .forms import CommunityForm, IssueForm, BaseIssueFormSet
from .models import CommunityEntry
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from shapely.geometry import Polygon, mapping
import geojson
import os
import json
from django.http import JsonResponse
from shapely.geometry import shape


#******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point

#******************************************************************************#

'''
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
'''
class Index(TemplateView):
    template_name = "main/index.html"

#******************************************************************************#

class Timeline(TemplateView):
    template_name = "main/timeline.html"

#******************************************************************************#

class Map(TemplateView):
    template_name = "main/map.html"
    # serialize('geojson', Entry.objects.all(), geometry_field='polygon', fields=('entry_polygon',))

    def get_context_data(self, **kwargs):
        # GEOJSONSerializer = serializers.get_serializer("geojson")
        # geojson_serializer = GEOJSONSerializer()
        # geojson_serializer.serialize(Entry.objects.only('entry_polygon'))
        # data = geojson_serializer.getvalue()
        # data = serialize("geojson", CommunityEntry.objects.all(
        # ), geometry_field="Polygon", fields=("entry_polygon", "Polygon",))
        # print("printing data")
        # print(data)
        # struct = json.loads(data)
        # data = Entry.objects.only('entry_polygon')

        # s = "".join(data)
        # something = geojson.loads(s)

        # print(geojson.loads(Entry.objects.all()))
        # print(data[0])
        # print(geojson.Polygon(data[0]))
        # data = json.dumps(struct)
        a = []
        for obj in CommunityEntry.objects.all():
            # print(obj.entry_polygon.geojson)
            a.append(obj.entry_polygon.geojson)

        final = []
        for obj in a:
            s = "".join(obj)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            print("printing the struct")
            print(struct)
            final.append(struct.coordinates)

        context = ({
            # 'entries':  serialize('geojson', Entry.objects.all(), geometry_field='polygon', fields=('entry_polygon')),
            # 'entries': data,
            'entries': final,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context

#******************************************************************************#

class Thanks(TemplateView):
    template_name = "main/thanks.html"

#******************************************************************************#

class EntryView(View, LoginRequiredMixin):
    '''
    EntryView displays the form and map selection screen.
    '''
    template_name = 'main/entry.html'
    form_class = CommunityForm
    initial = {'key': 'value'}
    success_url = '/thanks/'
    # Create the formset, specifying the form and formset we want to use.
    IssueFormSet = formset_factory(IssueForm, formset=BaseIssueFormSet)

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        print("get_initial")
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({'user': self.request.user})
        print(self.request.user)
        return initial

    def get(self, request, *args, **kwargs):
        print("GET")
        form = self.form_class(initial=self.get_initial())
        issue_formset = self.IssueFormSet(request.POST)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        print("POST")
        print(f"FORM IS VALID: {form.is_valid()}")
        form = self.form_class(request.POST)
        issue_formset = self.IssueFormSet(request.POST)
        if form.is_valid() and issue_formset.is_valid():
            print(form.cleaned_data)
            print(issue_formset.cleaned_data)
            # <process form cleaned data>
            return HttpResponseRedirect(self.success_url)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        return render(request, self.template_name, context)

#******************************************************************************#
