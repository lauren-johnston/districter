from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, ListView
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from allauth.account.decorators import verified_email_required
from django.forms import formset_factory
from .forms import CommunityForm, IssueForm
from .models import CommunityEntry, Issue, Tag
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from shapely.geometry import Polygon, mapping
import geojson, os, json, re
from django.http import JsonResponse

#******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon
from django.contrib.gis.db.models import Union

#******************************************************************************#
'''
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
'''

class Index(TemplateView):
    template_name = "main/index.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(
            **kwargs)  # get the default context data
        context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
        return context

#******************************************************************************#

class MainView(TemplateView):
    template_name = "main/main_test.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(MainView, self).get_context_data(
            **kwargs)  # get the default context data
        context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
        return context

#******************************************************************************#

class Timeline(TemplateView):
    template_name = "main/timeline.html"

#******************************************************************************#

class About(TemplateView):
    template_name = "main/about.html"

#******************************************************************************#
class Review(LoginRequiredMixin, TemplateView):
    template_name = "main/review.html"

    def get_context_data(self, **kwargs):
        entryPolyDict = dict()
        for obj in CommunityEntry.objects.filter(user = self.request.user):
            print(obj.census_blocks_multipolygon)
            if (obj.census_blocks_multipolygon == "" or obj.census_blocks_multipolygon == None):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_multipolygon.geojson)

            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates[0]
            for coord in struct.coordinates:
                print(coord)
                print("\n\n")
                print("why am i not printing anything?")

        context = ({
            'entries': entryPolyDict,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context
#******************************************************************************#

class Map(TemplateView):
    template_name = "main/map.html"
    def get_context_data(self, **kwargs):
        # the dict of issues + input of descriptions
        issues = dict()
        for obj in Issue.objects.all():
            cat = obj.category
            cat = re.sub("_", " ", cat).title()
            if cat == "Economic":
                cat = "Economic Affairs"
            if cat == "Health":
                cat = "Health and Health Insurance"
            if cat == "Internet":
                cat = "Internet Regulation"
            if cat == "Women":
                cat = "Women\'s Issues"
            if cat == "Lgbt":
                cat = "LGBT Issues"
            if cat == "Security":
                cat = "National Security"
            if cat == "Welfare":
                cat = "Social Welfare"

            if cat in issues:
                issues[cat][str(obj.entry)] = obj.description
            else:
                issueInfo = dict()
                issueInfo[str(obj.entry)] = obj.description
                issues[cat] = issueInfo

        # the polygon coordinates
        entryPolyDict = dict()
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids

        for obj in CommunityEntry.objects.all():
            # print(obj.tags.name)
            # zipcode = obj.zipcode
            if (obj.census_blocks_multipolygon == "" or obj.census_blocks_multipolygon == None):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_multipolygon.geojson)
                
            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            # for coord in struct.coordinates[0]:
            #     print(coord)
            #     print("\n\n")
            #     print("im printing something")
            entryPolyDict[obj.entry_ID] = struct.coordinates[0]
            # if zipcode in zips:
            #     zips[zipcode].append(obj.entry_ID)
            # else:
            #     zips[zipcode] = [obj.entry_ID]

        context = ({
            'tags': json.dumps(tags),
            'issues': json.dumps(issues),
            'entries': json.dumps(entryPolyDict),
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context

#******************************************************************************#


class Thanks(TemplateView):
    template_name = "main/thanks.html"

#******************************************************************************#


class EntryView(LoginRequiredMixin, View):
    '''
    EntryView displays the form and map selection screen.
    '''
    template_name = 'main/entry.html'
    form_class = CommunityForm
    initial = {'key': 'value'}
    success_url = '/thanks/'
    data = {
        'form-TOTAL_FORMS': '1',
        'form-INITIAL_FORMS': '0',
        'form-MAX_NUM_FORMS': '10'
    }
    # Create the formset, specifying the form and formset we want to use.
    IssueFormSet = formset_factory(IssueForm, extra=1)

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({'user': self.request.user})
        return initial

    def get(self, request, *args, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix='')
        issue_formset = self.IssueFormSet(self.data)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix='')
        issue_formset = self.IssueFormSet(request.POST)
        # print(form.data['census_blocks_multipolygon'])
        
        # print("printing the census polygon\n\n\n\n\n")
        # print(form.data['census_blocks_polygon'])

        # print("printing the user polygon\n\n\n\n\n")
        # print(form.data['user_polygon'])


        # print("\n\n printed out the drawn polygon")
        if form.is_valid() and issue_formset.is_valid():
            tag_ids = request.POST.getlist('tags')
            entryForm = form.save(commit=False)
            entryForm.save()
            # CommunityEntry.objects.raw('SELECT ')
            # queryset
            # lol = form.data['entry_ID']
            # hello = CommunityEntry.objects.filter(entry_ID = lol).values().aggregate(temp = Union('census_blocks_multipolygon'))
            # extract the coordinates and execute the query
            # print(hello)
            # entryForm.census_blocks_multipolygon = hello['temp']
            # entryForm.save()


            
            # q1 = CommunityEntry.objects.filter(entry_ID = lol).aggregate(Union(census_blocks_multipolygon))
            print("\n\n\n")
            # hello = CommunityEntry.objects.filter(entry_ID = lol).values('census_blocks_multipolygon').aggregate(temp = Union('cample_blocks_multipolygon'))
            # print(q1)
            

            # print(lol)
            # qs1.union(qs2).order_by('name')
            # print(request.POST.getlist('tags'))
            # entryForm.tags.add(tags[0])
            for tag_id in tag_ids:
                tag = Tag.objects.get(name=tag_id)
                entryForm.tags.add(tag)
            for issue_form in issue_formset:
                category = issue_form.cleaned_data.get('category')
                description = issue_form.cleaned_data.get('description')
                # Ignore form row if it's completely empty.
                if category and description:
                    issue = issue_form.save(commit=False)
                    # Set issueFormset form Foreign Key (entry) to the recently
                    # created entryForm.
                    issue.entry = entryForm
                    issue.save()

            return HttpResponseRedirect(self.success_url)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        # print(issue_formset)
        return render(request, self.template_name, context)

#******************************************************************************#
