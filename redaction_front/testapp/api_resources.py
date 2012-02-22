from tastypie.resources import ModelResource

from ella.photos.models import Photo


class PhotoResource(ModelResource):
    class Meta:
        queryset = Photo.objects.all()
        resource_name = 'photo'
