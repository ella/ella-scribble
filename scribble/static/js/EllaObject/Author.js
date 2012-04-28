define(['../EllaObject', '../EllaObject/User', '../Fields'], function(EllaObject, User, Fields) {
    var Author = EllaObject.subclass({
        type: 'author',
        fields: {
            user        : new Fields.foreign(User),
            name        : new Fields.text(),
            slug        : new Fields.text(),
            description : new Fields.text(),
            text        : new Fields.text(),
            email       : new Fields.text()
        }
    });
    return Author;
});
