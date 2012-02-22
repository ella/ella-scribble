from tastypie.resources import ModelResource
from tastypie import fields

from ella.photos.models import Photo
from ella.core.models import Publishable, Listing, Category, Author
from ella.articles.models import Article


class PhotoResource(ModelResource):
    class Meta:
        queryset = Photo.objects.all()
        resource_name = 'photo'
        excludes = ['slug']  # trying to redefine photo resource from testapp


class ListingResource(ModelResource):
    class Meta:
        queryset = Listing.objects.all()


class AuthorResource(ModelResource):
    class Meta:
        queryset = Author.objects.all()


class PublishableResource(ModelResource):
    photo = fields.ForeignKey(PhotoResource, 'photo', null=True)
    authors = fields.ToManyField(AuthorResource, 'authors', full=True)
    listings = fields.ToManyField(ListingResource, 'listing_set', full=True)

    class Meta:
        queryset = Publishable.objects.all()
        resource_name = 'publishable'


class ArticleResource(PublishableResource):

    class Meta:
        queryset = Article.objects.all()
        resource_name = 'article'
