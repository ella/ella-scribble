define(['../EllaObject', '../Auth/User', '../Fields'], function(EllaObject, User, Fields) {
    var Author = function(arg) {
        this.object_type = 'author';
        this.fields.user        = Fields.foreign;
        this.fields.name        = Fields.text;
        this.fields.slug        = Fields.text;
        this.fields.description = Fields.text;
        this.fields.text        = Fields.text;
        this.fields.email       = Fields.text;
        return this.init(arg);
    }
    Author.prototype = new EllaObject();
    Author.prototype.constructor = Author;
    return Author;
});
