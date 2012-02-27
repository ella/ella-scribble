define(['../EllaObject', '../Sites/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = function(arg) {
        this.fields.title = Fields.text;
        this.fields.description = Fields.text;
        this.fields.content = Fields.text;
        this.fields.template = Fields.text;
        this.fields.slug = Fields.text;
        this.fields.parent_category = Fields.foreign;
        this.fields.site = Fields.foreign;
        this.fields.app_data = Fields.json;
        return this.init(arg);
    };
    return Category;
    Category.prototype = new EllaObject();
    Category.prototype.constructor = Category;
});
