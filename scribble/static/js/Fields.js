define(['./Drawable', './lib/knockout', './lib/underscore'], function(Drawable, ko) {
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
        var field_constructor = get_field_constructor({
            type: 'foreign',
            field_fields: {
                draw: function() {
                    return this.val().draw('reference');
                },
                db_value: function() {
                    return this.val().values();
                }
            },
            get_initial_value: function(arg) {
                if (('_valid_field_value_type' in this) && arg.constructor === this._valid_field_value_type) {
                    return arg;
                }
                else {
                    return new this._valid_field_value_type(arg);
                }
            }
        });
        // called at e.g. Author.fields.user = new Fields.foreign(User)
        return function(name, valid_type) {
            var field_instantiator = field_constructor.apply(this, arguments);
            if (valid_type) field_instantiator._valid_field_value_type = valid_type;
            return field_instantiator;
        };
    })();
    
    Fields.array = (function() {
        var field_constructor = get_field_constructor({
            type: 'array',
            field_fields: {
                draw: function() {
                    var $ul = $('<ul>');
                    _(this.val()).each(function(v) {
                        $ul.append(v.draw('reference'));
                    });
                    return $ul;
                },
                db_value: function() {
                    return $.map(this.val(), function(f) {
                        return f.values();
                    });
                }
            },
            get_initial_value: function(arg) {
                var arr = $.makeArray(arg);
                var field = this;
                if ('_valid_element_type' in field) {
                    var validated_arr = _(arr).map(function(el) {
                        if (el.constructor === field._valid_element_type) {
                            return el;
                        }
                        return new field._valid_element_type(el);
                    });
                }
                return validated_arr;
            }
        });
        return function(name, valid_type) {
            var field_instantiator = field_constructor.apply(this, arguments);
            if (valid_type) field_instantiator._valid_element_type = valid_type;
            return field_instantiator;
        }
    })();
    
    function GenericField() {
        $.extend(this, new Drawable({
            name: 'GenericField',
            draw_modes: ['field']
        }));
        return this;
    };
    GenericField.prototype = {
        db_value: function() {
            var v = this.val();
            return v;
        },
        get_field_name: function() { return this.constructor.field_name }
    };
    
    function get_field_constructor(field_creation_arg) {
        // called at e.g. Article.fields.title = new Fields.text()
        var construct_field = function(field_name, field_construction_arg) {
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
                get_initial_value = _.identity;
            }
            
            // called at e.g. my_article.vals.title = new my_article.fields.title('Hello world')
            var instantiate_field = function(initial_value) {
                var me = this;
                me.val = ko.observable(get_initial_value.call(instantiate_field, initial_value));
                me.type = field_creation_arg.type;
                $.extend(this, field_creation_arg.field_fields);
                return me;
            };
            instantiate_field.prototype = new GenericField();
            instantiate_field.prototype.constructor = instantiate_field;
            instantiate_field.field_name = field_name;
            instantiate_field.validate_value = get_initial_value;
            return instantiate_field;
        }
        return construct_field;
    }
    
    return Fields;
});
