define(['../EllaObject', '../EllaObject/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = EllaObject.subclass({
        type: 'listing',
        fields: {
            commercial   : new Fields.bool(),
            publish_from : new Fields.datetime(),
            publish_to   : new Fields.datetime(),
            resource_uri : new Fields.text()
        }
    });
    return Category;
});
