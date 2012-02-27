define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Source = function(arg) {
        this.fields.name        = Fields.text;
        this.fields.url         = Fields.text;
        this.fields.description = Fields.description;
        return this.init(arg);
    };
    Source.prototype = new EllaObject();
    Source.prototype.constructor = Source;
    return Source;
});
