define(['../EllaObject', '../EllaObject/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = EllaObject.subclass({
        type: 'category',
        fields: {
            title       : new Fields.text(),
            description : new Fields.text(),
            content     : new Fields.text(),
            template    : new Fields.text(),
            slug        : new Fields.text(),
            site        : new Fields.foreign(Site),
            app_data    : new Fields.json()
        }
    });
    Category.declare_field('parent_category', new Fields.foreign(Category));
    return Category;
});
