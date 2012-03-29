define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var User = EllaObject.subclass({
        type: 'user',
        fields: {
            username: { type: Fields.text },
            password: { type: Fields.password }
        }
    });
    return User;
});
