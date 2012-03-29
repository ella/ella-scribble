define(['../EllaObject', '../Sites/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = EllaObject.subclass({
        type: 'category',
        fields: {
            title       : { type: Fields.text },
            description : { type: Fields.text },
            content     : { type: Fields.text },
            template    : { type: Fields.text },
            slug        : { type: Fields.text },
            parent_category: {
                type: Fields.foreign,
                construction_arg: Category
            },
            site: {
                type: Fields.foreign,
                construction_arg: Site
            },
            app_data: { type: Fields.json}
        }
    });
    return Category;
});
