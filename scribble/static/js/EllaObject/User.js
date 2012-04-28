define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var User = EllaObject.subclass({
        type: 'user',
        fields: {
            username : new Fields.text(),
            password : new Fields.password()
        }
    });
    return User;
});
