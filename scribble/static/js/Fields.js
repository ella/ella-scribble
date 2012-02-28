define(['./lib/knockout', './lib/underscore'], function(ko) {
    var Fields = {};
    
    Fields.text = function(str) {
        this.val = ko.observable(str || '');
        this.type = 'text';
        return this;
    };
    
    Fields.bool = function(is_true) {
        if (is_true !== undefined) is_true = !!is_true;
        this.val = ko.observable(is_true);
        this.type = 'bool';
        return this;
    };
    
    Fields.id = function(num) {
        this.val = ko.observable(num);
        this.type = 'id';
        return this;
    };
    
    Fields.password = function(str) {
        this.val = ko.observable(str || '');
        this.type = 'password';
        return this;
    };
    
    Fields.json = function(json) {
        this.val = ko.observable(json || '{}');
        this.type = 'json';
        return this;
    };
    
    Fields.datetime = function(dt) {
        this.val = ko.observable(dt);
        this.type = 'datetime';
        return this;
    };
    
    Fields.foreign = function(obj) {
        this.val = ko.observable(obj);
        this.type = 'foreign';
        this.draw = function() {
            return this.val().draw_reference();
        };
        this.db_value = function() {
            return this.val().vals.id.val();
        };
        return this;
    };
    
    Fields.array = function(arr) {
        this.val = ko.observableArray(arr);
        this.type = 'array';
        this.draw = function() {
            var $ul = $('<ul>');
            _(this.val()).each(function(v) {
                $ul.append(v.draw_reference());
            });
            return $ul;
        };
        this.db_value = _(this.val()).map(function(f) {
            return f.vals.id;
        });
        return this;
    };
    
    var GenericField = function() {
        this.draw = function() {
            var $input = $('<input data-bind="value: val">');
            ko.applyBindings({val: this.val}, $input[0]);
            return $input;
        };
        this.db_value = function() {
            var v = this.val();
            return v;
        };
        return this;
    };
    
    // Set up all fields to inherit from GenericField.
    // It is of essence that Fields only contains
    // specific fields and no methods or anything else
    // at this point in code!
    _(Fields).each(function(v) {
        v.prototype = new GenericField();
        v.prototype.constructor = v;
    });
    
    // Now we can define other properties of Fields.
    Fields.generic = GenericField;
    
    return Fields;
});
