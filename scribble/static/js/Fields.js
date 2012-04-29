/*

=head1 NAME

Fields -- The various things an EllaObject can have

=head1 SYNOPSIS

    require(['/path/to/Fields.js'], function(Fields) {
        // use an already-defined field type
        var TextFieldDeclaration = new Fields.text();
        
        // should match the key under which the field is stored within an
        // EllaObject. EllaObject.subclass does this for you.
        TextFieldDeclaration.field_name = 'given_name';
        
        var text_field = new TextFieldDeclaration('Freddie');
        alert('First name of Mercury is ' + text_field.val());
        text_field.val('John');
        alert('First name of Lennon is ' + text_field.val());


        // define a new Field type 'URL'
        Fields.url = get_field_constructor({
            type: 'url',    // mandatory
            validate_value: function(arg) {
                if (/^www\./.test(arg)) {
                    return 'http://' + arg;
                }
                else {
                    return arg;
                }
            }
        });
        var UrlFieldDeclaration = new Fields.url();
        var url_field = new UrlFieldDeclaration('www.example.org');
        location.href = url_field.val();
        // sends you to http://www.example.org


        // define a new field 'bracketed' with parametrized brackets
        Fields.bracketed = get_field_constructor({
            type: 'bracketed',
            validate_value: function(arg) {
                                 // stored at field constructor construction
                var brackets = this.field_construction_arg;
                return brackets[0] + arg + brackets[1];
            }
        });
        
        var BracedFieldDeclaration = new Fields.bracketed('{}');
        var braced_field = new BracedFieldDeclaration('a:1');
        alert(braced_field.val());  // alerts "{a:1}"
        
        var XmlTagFieldDeclaration = new Fields.bracketed('<>');
        var xmltag_field = new XmlTagFieldDeclaration('div');
        alert(xmltag_field.val());  // alerts "<div>"
    });

=head1 DESCRIPTION

Ella objects (like e.g. an article) have fields (like e.g. title or authors).
Each subclass of EllaObject has a different set of fields that it can have (e.g.
a user does not have a title) and each field can assume different values (e.g. a
datetime field cannot have the value 'Joe').

In order to let you define and enforce these restrictions declaratively and
briefly, the C<Fields> package is provided.

The Fields package defines a set of known field types. In case new field types
are required, they should be added directly here.

=head2 List of Provided Field Types

=over 4

=cut

*/
define(['./Drawable', './lib/knockout', './lib/underscore'], function(Drawable, ko) {
    var Fields = {};
    
    Fields.text = get_field_constructor({
        default_value: '',
        type: 'text'
    });
/*

=item bool

Represents a true/false value

=cut

*/
    Fields.bool = get_field_constructor({
        validate_value: function(arg) {
            if (arg !== undefined) {
                arg = !!arg;
            }
            return arg;
        },
        type: 'bool'
    });
/*

=item id

Represents an Ella object's primary key

=cut

*/
    Fields.id = get_field_constructor({
        type: 'id'
    });
/*

=item password

=cut

*/
    Fields.password = get_field_constructor({
        default_value: '',
        type: 'password'
    });
/*

=item json

=cut

*/
    Fields.json = get_field_constructor({
        default_value: '{}',
        type: 'json'
    });
/*

=item datetime

=cut

*/

    Fields.datetime = get_field_constructor({
        type: 'datetime'
    });
/*

=item foreign

Represents an EllaObject.

A constructor function can be passed as a parameter. This will restrict the
possible values to those constructed by the given function. Any other values
will be fed to the constructor and the result will be stored instead.

=cut

*/
    Fields.foreign = get_field_constructor({
        type: 'foreign',
        field_fields: $.extend(
            {
                draw: function() {
                    return this.val().draw('reference');
                },
                db_value: function() {
                    return this.val().values();
                }
            }, new Drawable({
                name: 'foreign',
                draw_modes: ['field']
            })
        ),
        validate_value: function(arg) {
            if (this.field_construction_arg) {
                var value_constructor = this.field_construction_arg;
                if (arg.constructor === value_constructor) {
                    return arg;
                }
                else {
                    return new value_constructor(arg);
                }
            }
            else {
                return arg;
            }
        }
    });
/*

=item array

Represents an array (a list) of values.

A constructor function can be provided as a parameter. In this case, all
elements of the array will be passed through the given constructor function.

This is in fact declaring the field to be an array of a given type.

=back

=cut

*/
    Fields.array = get_field_constructor({
        type: 'array',
        field_fields: $.extend(
            {
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
            }, new Drawable({
                name: 'array',
                draw_modes: ['field']
            })
        ),
        validate_value: function(arg) {
            var arr = $.makeArray(arg);
            var field = this;
            if (field.field_construction_arg) {
                value_constructor = field.field_construction_arg;
                var validated_arr = _(arr).map(function(el) {
                    if (el.constructor === value_constructor) {
                        return el;
                    }
                    return new value_constructor(el);
                });
            }
            return validated_arr;
        }
    });
/*

=head2 The Lineage of a Field

A I<field type> (defined here, in Fields) is a constructor for a
I<field declaration>. A field declaration is a constructor for a
I<field instance>. A field has, among other things, a I<value>.

    Fields.text;                                    // a field type
    TextFieldDeclaration = new Fields.text();       // a field declaration
    text_field = new TextFieldDeclaration('Love');  // a field instance
    text_field.val();                               // a field's value

    // going the chain up:
    text_field.constructor === TextFieldDeclaration
    TextFieldDeclaration.constructor === Fields.text

=head2 Parametrized Field Declarations

Judging solely from the above section, you may wonder why the declarations
exists at all -- why not simply write C<text_field = new Fields.text()>? The
answer lies in parametrized field declarations. When you provide an argument for
constructing a field declaration, that argument can then be used to validate or
transform the values. For example, take the C<array> field type:

    var atoms = [
        '1986-04-26T01:23+0300',
        '2011-03-11T05:46+0000'
    ];
    
    ArrayFieldDecl = new Fields.array();
    plain_array_field = new ArrayFieldDecl(atoms);
    plain_array_field.val();  // same as atoms array
    
    DateArrayFieldDecl = new Fields.array(Date);
    date_array_field = new DateArrayFieldDecl(atoms);
    date_array_field.val();
    // [ new Date('1986-04-26T01:23+0300'), new Date('2011-03-11T05:46+0000') ]

In the second paragraph, we declared the C<DateArrayFieldDecl> as
C<new Fields.array(Date)>, and all fields constructed with this declaration have
the array elements in the form of Date objects. That's because the parameter to
the array field type is interpreted as a constructor for array elements of a
field instance.

=cut

*/
    function GenericField() {
        $.extend(this, new Drawable({
            name: 'GenericField',
            draw_modes: ['field']
        }));
        return this;
    };
    GenericField.prototype = {
/*

=head2 Methods

=over4

=item db_value

Returns a string representation of the field that the backend can understand.

In normal case, returns simply the value of the field. Field types where this is
not correct should override the method.

=cut

*/
        db_value: function() {
            var v = this.val();
            return v;
        },
/*

=item get_field_name

Returns the name under which the field is stored within an Ella object.

The name must have been stored to the field_name property of the field
declaration, which is done by C<EllaObject.subclass>.

=cut

*/
        get_field_name: function() { return this.constructor.field_name },
/*

=item get_type

Returns the name of the field type (like I<text> or I<bool>).

*/
        get_type      : function() { return this.constructor.constructor.typestr }
    };
    Fields._GenericField = GenericField;
/*

=head2 Defining New Field Types

New field types are defined using the C<get_field_constructor> function. This
function is enclosed in the package, so you can only call it here within. Its
return value is the new field type. The only parameter is an object describing
the new type.

To describe the new type, you must specify:

=over 4

=item 1. the name of the type (mandatory),

=item 2. which values a field of this type can have,

=item 3. how this field will serialize itself for the database,

=item 4. how this field will render itself to HTML and

=item 5. what optional additional methods or properties the field will have.

=back

Ad (1): The name of the field type is specified in the C<type> property. This is
the only mandatory property, and must be a string.

Ad (2): The legal values of a field of this type can be specified in the form
of a validator function. This validator is called whenever a new field instance
is constructed and also when a new value is set to the field using EllaObject's
C<set> method. The parameter to the validator is the provided value for the
field. The validator is called in the context of the field declaration.

The validator function is specified in the C<validate_value> property.

If you just want to provide a default value for the case that the field's value
is not provided at all, you can, instead of creating a function, just specify
the C<default_value> property. Please note that if you specify both
C<validate_value> and C<default_value>, then C<default_value> will be silently
ignored.

If you provide neither C<validate_value> nor C<default_value>, then the value
will be left alone and the field will have whatever you provide.

=cut

*/
    function get_field_constructor(field_creation_arg) {
        // called at e.g. Article.field_declarations.title = new Fields.text()
        var construct_field = function(field_construction_arg, field_name) {
//            if (arguments.length == 0) return this;
            
            if ('type' in field_creation_arg) {} else {
                throw 'type must be specified at field creation';
            }
            if (!_.isString(field_creation_arg.type)) {
                throw 'field type must be a string';
            }
            
            var validate_value;
            if ($.isFunction(field_creation_arg.validate_value)) {
                validate_value = field_creation_arg.validate_value;
            }
            else if ('default_value' in field_creation_arg) {
                validate_value = function(v) { return v || field_creation_arg.default_value; };
            }
            else {
                validate_value = _.identity;
            }
            
            // called at e.g. my_article.fields.title = new my_article.field_declarations.title('Hello world')
            var instantiate_field = function(initial_value) {
                var me = this;
                var initial_value = validate_value.call(instantiate_field, initial_value);
                if ($.isArray(initial_value)) {
                    me.val = ko.observableArray(initial_value);
                }
                else {
                    me.val = ko.observable(initial_value);
                }
                $.extend(this, field_creation_arg.field_fields);
                return me;
            };
            instantiate_field.prototype = new GenericField();
            instantiate_field.prototype.constructor = instantiate_field;
            if (field_name) instantiate_field.field_name = field_name;
            instantiate_field.validate_value = validate_value;
            instantiate_field.field_construction_arg = field_construction_arg;
            instantiate_field.constructor = construct_field;
            return instantiate_field;
        }
        construct_field.typestr = field_creation_arg.type;
        construct_field.prototype = new GenericField();
        construct_field.prototype.constructor = construct_field;
        return construct_field;
    }
    
    Fields.get_type_of = function(obj) {
        if (obj instanceof GenericObject) {} else {
            return null;
        }
        if (obj.type in Fields) {
            return Fields[obj.get_type()];
        }
    }

    return Fields;
});
