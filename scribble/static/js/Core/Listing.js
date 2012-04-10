define(['../EllaObject', '../Sites/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = EllaObject.subclass({
        type: 'category',
        fields: {
            commercial   : { type: Fields.bool     },
            publish_from : { type: Fields.datetime },
            publish_to   : { type: Fields.datetime },
            resource_uri : { type: Fields.text     }
        }
    });
    return Category;
});
