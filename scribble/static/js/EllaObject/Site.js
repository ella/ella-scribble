define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Site = EllaObject.subclass({
        type: 'site',
        fields: {
            domain_name  : new Fields.text(),
            display_name : new Fields.text()
        }
    });
    return Site;
});
