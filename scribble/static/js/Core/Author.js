define(['../EllaObject', '../Auth/User', '../Fields'], function(EllaObject, User, Fields) {
    var Author = function(arg) {
        this.object_type = 'author';
        this.fields.user        = new Fields.foreign(User);
        this.fields.name        = new Fields.text();
        this.fields.slug        = new Fields.text();
        this.fields.description = new Fields.text();
        this.fields.text        = new Fields.text();
        this.fields.email       = new Fields.text();
        return this.init(arg);
    }
    Author.prototype = new EllaObject();
    Author.prototype.constructor = Author;
    return Author;
});
