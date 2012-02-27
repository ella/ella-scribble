define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var User = function(arg) {
        this.fields.username = Fields.text;
        this.fields.password = Fields.password;
        return this.init(arg);
    };
    User.prototype = new EllaObject();
    User.prototype.constructor = User;
    return User;
});
