define(['../EllaObject', '../Auth/User', '../Fields'], function(EllaObject, User, Fields) {
    var Author = EllaObject.subclass({
        type: 'author',
        fields: {
            user: {
                type: Fields.foreign,
                construction_arg: User
            },
            name        : { type: Fields.text },
            slug        : { type: Fields.text },
            description : { type: Fields.text },
            text        : { type: Fields.text },
            email       : { type: Fields.text },
        }
    });
    return Author;
});
