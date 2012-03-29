define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Site = EllaObject.subclass({
        type: 'site',
        fields: {
            domain_name:  { type: Fields.text },
            display_name: { type: Fields.text }
        }
    });
    return Site;
});
