define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Source = function(arg) {
        this.object_type = 'source';
        this.fields.name        = new Fields.text();
        this.fields.url         = new Fields.text();
        this.fields.description = new Fields.description();
        return this.init(arg);
    };
    Source.prototype = new EllaObject();
    Source.prototype.constructor = Source;
    return Source;
});
