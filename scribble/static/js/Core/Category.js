define(['../EllaObject', '../Sites/Site', '../Fields'], function(EllaObject, Site, Fields) {
    var Category = function(arg) {
        this.object_type = 'category';
        this.fields.title           = new Fields.text();
        this.fields.description     = new Fields.text();
        this.fields.content         = new Fields.text();
        this.fields.template        = new Fields.text();
        this.fields.slug            = new Fields.text();
        this.fields.parent_category = new Fields.foreign(Category);
        this.fields.site            = new Fields.foreign(Site);
        this.fields.app_data        = new Fields.json();
        return this.init(arg);
    };
    return Category;
    Category.prototype = new EllaObject();
    Category.prototype.constructor = Category;
});
