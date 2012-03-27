define(['./lib/knockout', './lib/underscore'], function(ko) {
    var Fields = {};
    
    Fields.text = get_field_constructor({
        default_value: '',
        type: 'text'
    });
    
    Fields.bool = get_field_constructor({
        get_initial_value: function(arg) {
            if (arg !== undefined) {
                arg = !!arg;
            }
            return arg;
        },
        type: 'bool'
    });
    
    Fields.id = get_field_constructor({
        type: 'id'
    });
    
    Fields.password = get_field_constructor({
        default_value: '',
        type: 'password'
    });
    
    Fields.json = get_field_constructor({
        default_value: '{}',
        type: 'json'
    });
    
    Fields.datetime = get_field_constructor({
        type: 'datetime'
    });
    
    Fields.foreign = (function() {
        var rv = get_field_constructor.call(this,{
            type: 'foreign',
            field_fields: {
                draw: function() {
                    return this.val().draw_reference();
                },
                db_value: function() {
                    return this.val().vals.id.val();
                }
            },
            get_initial_value: function(arg, obj) {
                if (('_valid_constructor' in obj) && arg.constructor === obj._valid_constructor) {
                    // OK
                }
                else {
                    ;;; console.log('expecting:',obj._valid_constructor,'got:',arg,'this:',this);
                    throw "Invalid foreign object";
                }
                return arg;
            },
            construction_callback: function(valid_constructor) {
                rv._valid_constructor = valid_constructor;
            }
        });
        return function(arg) { var _rv = rv.apply(this,arg); _rv._valid_constructor = arg; return _rv; };
    })();
    
    Fields.array = get_field_constructor({
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
    
    function get_field_constructor(field_creation_arg) {
        var construct_field = function(field_construction_arg) {
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
            
            var instantiate_field = function(initial_value, obj) {
                var me = this;
                me.val = ko.observable(get_initial_value.call(me, initial_value, instantiate_field));
                me.type = field_creation_arg.type;
                $.extend(this, field_creation_arg.field_fields);
                me.field_constructor = construct_field;
                return me;
            };
            instantiate_field.prototype = new GenericField();
            instantiate_field.prototype.constructor = instantiate_field;
            return instantiate_field;
        }
        return construct_field;
    }
    
    return Fields;
});
