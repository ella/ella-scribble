define(['./lib/knockout', './lib/underscore'], function(ko) {
    var Fields = {};
    
    Fields.text = create_field({
        default_value: '',
        type: 'text'
    });
    
    Fields.bool = create_field({
        get_initial_value: function(arg) {
            if (arg !== undefined) {
                arg = !!arg;
            }
            return arg;
        },
        type: 'bool'
    });
    
    Fields.id = create_field({
        type: 'id'
    });
    
    Fields.password = create_field({
        default_value: '',
        type: 'password'
    });
    
    Fields.json = create_field({
        default_value: '{}',
        type: 'json'
    });
    
    Fields.datetime = create_field({
        type: 'datetime'
    });
    
    Fields.foreign = create_field({
        type: 'foreign',
        field_fields: {
            draw: function() {
                return this.val().draw_reference();
            },
            db_value: function() {
                return this.val().vals.id.val();
            }
        }
    });
    
    Fields.array = create_field({
        type: 'array',
        field_fields: {
            draw: function() {
                var $ul = $('<ul>');
                _(this.val()).each(function(v) {
                    $ul.append(v.draw_reference());
                });
                return $ul;
            },
            db_value: function() {
                return _.(this.vals()).map( function(f) {
                    return f.vals.id;
                });
            }
        }
    });
    
    function GenericField() {
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
    
    function create_field(field_creation_arg) {
        if ('type' in field_creation_arg) {} else {
            throw 'type must be specified at field creation';
        }
        
        var get_initial_value;
        if ($.isFunction(field_creation_arg.get_initial_value)) {
            get_initial_value = field_creation_arg.get_initial_value;
        }
        else if ('default_value' in field_creation_arg) {
            get_initial_value = function(v) { return v || field_creation_arg.default_value; };
        }
        else {
            get_initial_value = function(v) { return v; };
        }
        
        var rv = function(initial_value) {
            var me = this;
            me.val = get_initial_value(initial_value);
            me.type = field_creation_arg.type;
            $.extend(this, field_creation_arg.field_fields);
            return me;
        };
        rv.prototype = new GenericField();
        rv.prototype.constructor = rv;
        return rv;
    }
    
    return Fields;
});
