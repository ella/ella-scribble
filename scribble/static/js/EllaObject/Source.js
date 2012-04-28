define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var Source = EllaObject.subclass({
        type: 'source',
        fields: {
            name        : new Fields.text(),
            url         : new Fields.text(),
            description : new Fields.text()
        }
    });
    return Source;
});
