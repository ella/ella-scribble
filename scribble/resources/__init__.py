from tastypie.resources import ModelResource
from tastypie import fields
from tastypie.authorization import Authorization

from ella.photos.models import Photo
from django.contrib.auth.models import User
from ella.core.models import Publishable, Listing, Category, Author
from ella.articles.models import Article

class CategoryResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Category.objects.all()
        filtering = {
            'app_data'         : ('exact',),
            'content'          : ('exact',),
            'description'      : ('exact',),
            'id'               : ('exact',),
            'resource_uri'     : ('exact',),
            'slug'             : ('exact',),
            'template'         : ('exact',),
            'title'            : ('exact',),
            'tree_path'        : ('exact',),
        }


class UserResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = User.objects.all()
        resource_name = 'user'
        filtering = {
            'id'               : ('exact',),
            'username'         : ('exact',),
        }

class PhotoResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Photo.objects.all()
        resource_name = 'photo'
        filtering = {
            'app_data'         : ('exact',),
            'created'          : ('exact',),
            'description'      : ('exact',),
            'height'           : ('exact',),
            'id'               : ('exact',),
            'image'            : ('exact',),
            'important_bottom' : ('exact',),
            'important_left'   : ('exact',),
            'important_right'  : ('exact',),
            'important_top'    : ('exact',),
            'resource_uri'     : ('exact',),
            'title'            : ('exact',),
            'width'            : ('exact',),
        }


class ListingResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Listing.objects.all()
        filtering = {
            'commercial'       : ('exact',),
            'id'               : ('exact',),
            'publish_from'     : ('exact',),
            'publish_to'       : ('exact',),
            'resource_uri'     : ('exact',),
        }


class AuthorResource(ModelResource):
    class Meta:
        authorization = Authorization()
        queryset = Author.objects.all()
        filtering = {
            'description'      : ('exact',),
            'email'            : ('exact',),
            'id'               : ('exact',),
            'name'             : ('exact',),
            'resource_uri'     : ('exact',),
            'slug'             : ('exact',),
            'text'             : ('exact',),
        }


class PublishableResource(ModelResource):
    photo = fields.ForeignKey(PhotoResource, 'photo', null=True)
    authors = fields.ToManyField(AuthorResource, 'authors', full=True)
    listings = fields.ToManyField(ListingResource, 'listing_set', full=True)
    category = fields.ForeignKey(CategoryResource, 'category', full=True)

    class Meta:
        authorization = Authorization()
        queryset = Publishable.objects.all()
        resource_name = 'publishable'
        filtering = {
            'announced'        : ('exact',),
            'app_data'         : ('exact',),
            'authors'          : ('exact',),
            'category'         : ('exact',),
            'description'      : ('exact',),
            'id'               : ('exact',),
            'listings'         : ('exact',),
            'photo'            : ('exact',),
            'publish_from'     : ('exact',),
            'publish_to'       : ('exact',),
            'published'        : ('exact',),
            'resource_uri'     : ('exact',),
            'slug'             : ('exact',),
            'static'           : ('exact',),
            'title'            : ('exact',),
        }

    def dehydrate(self, bundle):
        bundle.data['url'] = bundle.obj.get_domain_url()
        return bundle


class ArticleResource(PublishableResource):

    class Meta:
        authorization = Authorization()
        queryset = Article.objects.all()
        resource_name = 'article'
        filtering = {
            'announced'        : ('exact',),
            'app_data'         : ('exact',),
            'authors'          : ('exact',),
            'category'         : ('exact',),
            'content'          : ('exact',),
            'created'          : ('exact',),
            'description'      : ('exact',),
            'id'               : ('exact',),
            'listings'         : ('exact',),
            'photo'            : ('exact',),
            'publish_from'     : ('exact',),
            'publish_to'       : ('exact',),
            'published'        : ('exact',),
            'resource_uri'     : ('exact',),
            'slug'             : ('exact',),
            'static'           : ('exact',),
            'title'            : ('exact',),
            'updated'          : ('exact',),
            'upper_title'      : ('exact',),
        }
