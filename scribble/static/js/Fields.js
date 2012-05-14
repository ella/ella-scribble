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
        alert('First name of Mercury is ' + text_field.get());
        text_field.set('John');
        alert('First name of Lennon is ' + text_field.get());


        // define a new Field type 'URL'
        Fields.url = define_field_type({
            type: 'url',    // mandatory
            validate_value: function(arg) {
                if (/^www\./.test(arg)) {
                    return 'http://' + arg;
                }
                else if (/^http:\/\//.test(arg)) {
                    return arg;
                }
                else {
                    throw 'Invalid URL';
                }
            }
        });
        var UrlFieldDeclaration = new Fields.url();
        var url_field = new UrlFieldDeclaration('www.example.org');
        location.href = url_field.get();
        // sends you to http://www.example.org


        // define a new field 'bracketed' with parametrised brackets
        Fields.bracketed = define_field_type({
            type: 'bracketed',
            on_declaration: function(brackets) {
                // 'this' is the constructor of field instances
                this.lbracket = brackets[0] || '(';
                this.rbracket = brackets[1] || ')';
            }
            validate_value: function(arg) {
                var brackets = this.field_declaration_parameter;
                return brackets[0] + arg + brackets[1];
            }
        });
        
        var BracedFieldDeclaration = new Fields.bracketed('{}');
        var braced_field = new BracedFieldDeclaration('a:1');
        alert(braced_field.get());  // alerts "{a:1}"
        
        var XmlTagFieldDeclaration = new Fields.bracketed('<>');
        var xmltag_field = new XmlTagFieldDeclaration('div');
        alert(xmltag_field.get());  // alerts "<div>"
        xmltag_field.set('span');
        alert(xmltag_field.get());  // alerts "<span>"
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
    
/*

=item text

Represents a textual value (a string)

=cut

*/
    Fields.text = define_field_type({
        default_value: '',
        type: 'text'
    });
/*

=item bool

Represents a true/false value

=cut

*/
    Fields.bool = define_field_type({
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
    Fields.id = define_field_type({
        type: 'id'
    });
/*

=item password

=cut

*/
    Fields.password = define_field_type({
        default_value: '',
        type: 'password'
    });
/*

=item json

=cut

*/
    Fields.json = define_field_type({
        type: 'json',
        validate_value: function(json) {
            if (json === undefined) {
                return '{}';
            }
            if (!_.isString(json)) {
                throw 'JSON field only accepts values of JSON strings';
            }
            $.parseJSON(json);
            return json;
        }
    });
/*

=item datetime

=cut

*/

    Fields.datetime = define_field_type({
        type: 'datetime',
        validate_value: function(val) {
            if ( _.isDate(val) ) return val;
            else {
                var date = new Date(val);
                if (_.isNaN(date.getTime())) {
                    ;;; console.log('Invalid date:',val);
                    throw 'Invalid date';
                }
                else return date;
            }
        }
    });
/*

=item foreign

Represents an EllaObject.

A constructor function can be passed as a parameter. This will restrict the
possible values to those constructed by the given function. Any other values
will be fed to the constructor and the result will be stored instead.

=cut

*/
    Fields.foreign = define_field_type({
        type: 'foreign',
        field_fields: $.extend(
            {
                draw: function() {
                    return this.get().draw('reference');
                },
                db_value: function() {
                    return this.get().values();
                }
            }, new Drawable({
                name: 'foreign',
                draw_modes: ['field']
            })
        ),
        on_declaration: function(legal_value_type) {
            if (legal_value_type === undefined) return;
            if (!$.isFunction(legal_value_type)) {
                ;;; console.log('At "foreign" field declaration, constructor expected, got',legal_value_type);
                throw 'Can only restrict foreign field with a constructor';
            }
            this.legal_value_type = legal_value_type;
        },
        validate_value: function(new_value) {
            if ('legal_value_type' in this) {
                var value_constructor = this.legal_value_type;
                if (new_value.constructor === value_constructor) {
                    return new_value;
                }
                else {
                    return new value_constructor(new_value);
                }
            }
            else {
                return new_value;
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
    Fields.array = define_field_type({
        type: 'array',
        field_fields: $.extend(
            {
                draw: function() {
                    var $ul = $('<ul>');
                    _(this.get()).each(function(v) {
                        $ul.append(v.draw('reference'));
                    });
                    return $ul;
                },
                db_value: function() {
                    return $.map(this.get(), function(f) {
                        return f.values();
                    });
                }
            }, new Drawable({
                name: 'array',
                draw_modes: ['field']
            })
        ),
        on_declaration: function(legal_element_type) {
            if (arguments.length === 0) return;
            if (!$.isFunction(legal_element_type)) {
                ;;; console.log('At "array" field declaration, constructor expected, got',legal_element_type);
                throw 'Can only restrict array field with a constructor';
            }
            this.legal_element_type = legal_element_type;
        },
        validate_value: function(arg) {
            var arr = $.makeArray(arg);
            var field_declaration = this;
            if ('legal_element_type' in field_declaration) {
                value_constructor = field_declaration.legal_element_type;
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
    text_field.get();                               // a field's value

    // going the chain up:
    text_field.constructor === TextFieldDeclaration
    TextFieldDeclaration.constructor === Fields.text

=head2 Parametrised Field Declarations

Judging solely from the above section, you may wonder why the declarations
exists at all -- why not simply write C<text_field = new Fields.text()>? The
answer lies in parametrised field declarations. When you provide an argument for
constructing a field declaration, that argument can then be used to validate or
transform the values. For example, take the C<array> field type:

    var atoms = [
        '1986-04-26T01:23+0300',
        '2011-03-11T14:46+0900'
    ];
    
    // without parametrisation
    ArrayFieldDecl = new Fields.array();
    plain_array_field = new ArrayFieldDecl(atoms);
    plain_array_field.get();
    // [ '1986-04-26T01:23+0300', '2011-03-11T14:46+0900' ]
    
    // with parametrisation
    DateArrayFieldDecl = new Fields.array(Date);
    date_array_field = new DateArrayFieldDecl(atoms);
    date_array_field.get();
    // [ new Date('1986-04-26T01:23+0300'), new Date('2011-03-11T14:46+0900') ]

In the second paragraph, we declared the C<DateArrayFieldDecl> as
C<new Fields.array(Date)>, and all fields constructed with this declaration have
the array elements in the form of Date objects. That's because the parameter to
the array field type is interpreted as a constructor for array elements of a
field instance. A parametrised type accepts a parameter at construction of field
declaration and can use that parameter at will.

The foreseen usage is to validate / process the parameter at declaration time,
save the processed parameter as a property of C<this> and then accesses it at
instantiation time.

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

=over 4

=item get

Returns the value stored in the field.

The value as such is actually stored in the C<val> property -- you can equally
use it as an accessor if you like. But beware that the C<val> property is a
Knockout observable, so you 1) still have to call it as a function and 2) if you
accidentally pass an argument to C<val>, you overwrite the value, losing the old
one and circumventing the validation, so you may also want to stick with C<get>
and C<set>.

=cut

*/
        get: function() { return this.val() },
/*

=item db_value

Returns a string representation of the field that the backend can understand.

In normal case, returns simply the value of the field. Field types where this is
not correct should override the method.

=cut

*/
        db_value: function() { return this.val() },
/*

=item get_field_name

Returns the name under which the field is stored within an Ella object.

The name must have been stored to the field_name property of the field
declaration, which is done automatically if you bind the field to an Ella object
with C<EllaObject.subclass> or C<EllaObject_subclass.declare_field>.

=cut

*/
        get_field_name: function() { return this.constructor.field_name },
/*

=item get_type

Returns the name of the field type (like I<text> or I<bool>).

=cut

*/
        get_type: function() { return this.constructor.constructor.typestr },
/*

=item set

Sets the field's value to the one provided in the argument and returns the
previous value.

In case the field got a C<validate_value> function at declaration, the provided
value is fed as argument to this validator and the return value is stored.

To really store what you provided, bypassing validation, you can call C<val>
directly. But why would you do that?

=back

=cut

*/
        set: function(new_val) {
            var fd = this.constructor;
            var validated_val = fd.validate_value(new_val);
            var old_val = this.get();
            this.val(validated_val);
            return old_val;
        }
    };
    Fields._GenericField = GenericField;
/*

=head2 Defining New Field Types

New field types are defined using the C<define_field_type> function. This function is
enclosed in the package, so you can only call it here within. Its return value
is the new field type. The only parameter is an object describing the new type.

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

In case of parametrised field declarations, the given parameter is automatically
stored as C<field_declaration_parameter> in the field declaration. The validator can
therefore access it as C<this.field_declaration_parameter>. But better still, you can
validate the given parameter at declaration and store the processed parameter
under (a) more descriptive name(s).

To process the declaration parameter, specify the C<on_declaration> function. It
will get the declaration parameter as argument and will be called in the context
of the declaration (just like C<validate_value>).

Ad (3): The C<db_value> method of a field should return a string that represents
the field's value in a manner that the server API understands. If the default
behavior (simply returning the value) is not appropriate, you should override
this method.

The overriding of field properties in general is done by specifying a
C<field_fields> object. In this case:

    field_fields: { db_value: function() { return _transform(this.get()) } }

Ad (4): Ella objects are I<Drawable>, under the C<EllaObject> name. To specify a
different template, make the field Drawable anew. This can be done by extending
the C<field_fields> object by C<new Drawable>:

    field_fields: $.extend({...}, new Drawable({
        name: foo,
        draw_modes: ['field']
    }),

Ad (5): Specify any other methods or properties a field of the newly defined
type should have in the C<field_fields> object.

A complete example:

    Fields.bracketed = define_field_type({
        type: 'bracketed',
        on_declaration: function(brackets) {
            this.lbracket = brackets[0] || '(';
            this.rbracket = brackets[1] || ')';
        },
        validate_value: function(arg) {
            return this.lbracket + arg + this.rbracket;
        },
        field_fields: $.extend(
            {
                db_value: function() { return this.val(); },
                get_bracketless: function() {
                    var lbracket = this.constructor.lbracket;
                    var rbracket = this.constructor.rbracket;
                    return this.val().slice(lbracket.length,-rbracket.length);
                }
            }, new Drawable({
                name: 'bracketed',
                draw_modes: ['field']
            })
        )
    });

=cut

*/
    function define_field_type(field_type_description) {
        if ('type' in field_type_description) {} else {
            throw 'type must be specified at field creation';
        }
        if (!_.isString(field_type_description.type)) {
            throw 'field type must be a string';
        }
        
        var validate_value;
        if ($.isFunction(field_type_description.validate_value)) {
            validate_value = field_type_description.validate_value;
        }
        else if ('default_value' in field_type_description) {
            validate_value = function(v) { return v || field_type_description.default_value; };
        }
        else {
            validate_value = _.identity;
        }
        
        // called at e.g. Article.field_declarations.title = new Fields.text()
        var field_definition = function(field_declaration_parameter, field_name) {
            
            // called at e.g. my_article.fields.title = new my_article.field_declarations.title('Hello world')
            var field_declaration = function(initial_value) {
                var me = this;
                var initial_value = validate_value.call(field_declaration, initial_value);
                if ($.isArray(initial_value)) {
                    me.val = ko.observableArray(initial_value);
                }
                else {
                    me.val = ko.observable(initial_value);
                }
                return me;
            };
            
            field_declaration.prototype = $.extend(
                new GenericField(),
                field_type_description.field_fields
            );
            field_declaration.prototype.constructor = field_declaration;
            field_declaration.constructor = field_definition;
            
            field_declaration.validate_value = validate_value;
            
            if (field_name) field_declaration.field_name = field_name;
            
            field_declaration.field_declaration_parameter = field_declaration_parameter;
            if ($.isFunction(field_type_description.on_declaration)) {
                field_type_description.on_declaration.call(field_declaration, field_declaration_parameter);
            }
            
            return field_declaration;
        }
        field_definition.typestr = field_type_description.type;
        field_definition.prototype = new GenericField();
        field_definition.prototype.constructor = field_definition;
        return field_definition;
    }
/*

=head2 Checking if Something is a Field

JavaScript does not allow to construct callable objects. Since the field
definitions return field constructors, the inheritance hierarchy cannot be
formally kept, so C<article.fields.title instanceof Fields.text> returns
B<false>.

To compensate for this unfortunate fact, the C<Fields.get_type_of> function is
provided. It takes as argument any value and in case it is a field instance, it
returns its type constructor. The type name can then be retrieved via the
C<typestr> property. If the argument is not a field instance, C<null> is
returned.

    Fields.get_type_of(1);   // null
    Fields.get_type_of(article.fields.title);   // Fields.text
    Fields.get_type_of(article.fields.title).typestr;   // "text"

So instead of C<$thing instanceof Fields.text>, you can write
C<Fields.get_type_of($thing) === Fields.text>.

=cut

*/
    Fields.get_type_of = function(obj) {
        if (obj instanceof GenericField) {} else {
            return null;
        }
        return obj.constructor.constructor;
    }

    return Fields;
});
