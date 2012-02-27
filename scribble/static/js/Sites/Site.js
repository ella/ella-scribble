define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Site = function(arg) {
        this.fields.domain_name  = Fields.text;
        this.fields.display_name = Fields.text;
        return this.init(arg);
    };
    Site.prototype = new EllaObject();
    Site.prototype.constructor = Site;
    return Site;
});
