from tastypie.resources import ModelResource
from tastypie import fields
from tastypie.authorization import Authorization

from ella.photos.models import Photo
from ella.core.models import Publishable, Listing, Category, Author
from ella.articles.models import Article


class PhotoResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Photo.objects.all()
        resource_name = 'photo'
        excludes = ['slug']  # trying to redefine photo resource from testapp


class ListingResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Listing.objects.all()


class AuthorResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Author.objects.all()


class PublishableResource(ModelResource):
    photo = fields.ForeignKey(PhotoResource, 'photo', null=True)
    authors = fields.ToManyField(AuthorResource, 'authors', full=True)
    listings = fields.ToManyField(ListingResource, 'listing_set', full=True)

    class Meta:
        authorization = Authorization()
        queryset = Publishable.objects.all()
        resource_name = 'publishable'


class ArticleResource(PublishableResource):

    class Meta:
        authorization = Authorization()
        queryset = Article.objects.all()
        resource_name = 'article'
