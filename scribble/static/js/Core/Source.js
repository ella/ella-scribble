define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Source = EllaObject.subclass({
        type: 'source',
        fields: {
            name        : { type: Fields.text },
            url         : { type: Fields.text },
            description : { type: Fields.description }
        }
    });
    return Source;
});
