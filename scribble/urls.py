from django.contrib import admin
from django.conf.urls.defaults import patterns, include, url, handler404, handler500
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic.simple import direct_to_template

admin.autodiscover()

from redaction.api import RedactionApi
api = RedactionApi(api_name='r1')
api.collect_resources()


urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    (r'^api/', include(api.urls)),

    (r'^$', direct_to_template, {'template': 'index.html'}),
    (r'^articles/$', direct_to_template, {'template': 'articles.html'}),

    ('^', include('ella.core.urls')),

) + staticfiles_urlpatterns()
