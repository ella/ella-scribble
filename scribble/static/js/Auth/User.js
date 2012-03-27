define(['../EllaObject', '../Fields'], function(EllaObject, Fields) {
    var User = function(arg) {
        this.object_type = 'user';
        this.fields.username = new Fields.text();
        this.fields.password = new Fields.password();
        return this.init(arg);
    };
    User.prototype = new EllaObject();
    User.prototype.constructor = User;
    return User;
});
