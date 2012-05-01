.. highlight:: javascript


****
NAME
****


Fields -- The various things an EllaObject can have


********
SYNOPSIS
********



.. code-block:: javascript

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



***********
DESCRIPTION
***********


Ella objects (like e.g. an article) have fields (like e.g. title or authors).
Each subclass of EllaObject has a different set of fields that it can have (e.g.
a user does not have a title) and each field can assume different values (e.g. a
datetime field cannot have the value 'Joe').

In order to let you define and enforce these restrictions declaratively and
briefly, the \ ``Fields``\  package is provided.

The Fields package defines a set of known field types. In case new field types
are required, they should be added directly here.

List of Provided Field Types
============================



bool
 
 Represents a true/false value
 


id
 
 Represents an Ella object's primary key
 


password



json



datetime



foreign
 
 Represents an EllaObject.
 
 A constructor function can be passed as a parameter. This will restrict the
 possible values to those constructed by the given function. Any other values
 will be fed to the constructor and the result will be stored instead.
 


array
 
 Represents an array (a list) of values.
 
 A constructor function can be provided as a parameter. In this case, all
 elements of the array will be passed through the given constructor function.
 
 This is in fact declaring the field to be an array of a given type.
 



The Lineage of a Field
======================


A \ *field type*\  (defined here, in Fields) is a constructor for a
\ *field declaration*\ . A field declaration is a constructor for a
\ *field instance*\ . A field has, among other things, a \ *value*\ .


.. code-block:: javascript

     Fields.text;                                    // a field type
     TextFieldDeclaration = new Fields.text();       // a field declaration
     text_field = new TextFieldDeclaration('Love');  // a field instance
     text_field.get();                               // a field's value
 
     // going the chain up:
     text_field.constructor === TextFieldDeclaration
     TextFieldDeclaration.constructor === Fields.text



Parametrised Field Declarations
===============================


Judging solely from the above section, you may wonder why the declarations
exists at all -- why not simply write \ ``text_field = new Fields.text()``\ ? The
answer lies in parametrised field declarations. When you provide an argument for
constructing a field declaration, that argument can then be used to validate or
transform the values. For example, take the \ ``array``\  field type:


.. code-block:: javascript

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


In the second paragraph, we declared the \ ``DateArrayFieldDecl``\  as
\ ``new Fields.array(Date)``\ , and all fields constructed with this declaration have
the array elements in the form of Date objects. That's because the parameter to
the array field type is interpreted as a constructor for array elements of a
field instance. A parametrised type accepts a parameter at construction of field
declaration and can use that parameter at will.

The foreseen usage is to validate / process the parameter at declaration time,
save the processed parameter as a property of \ ``this``\  and then accesses it at
instantiation time.


Methods
=======



get
 
 Returns the value stored in the field.
 
 The value as such is actually stored in the \ ``val``\  property -- you can equally
 use it as an accessor if you like. But beware that the \ ``val``\  property is a
 Knockout observable, so you 1) still have to call it as a function and 2) if you
 accidentally pass an argument to \ ``val``\ , you overwrite the value, losing the old
 one and circumventing the validation, so you may also want to stick with \ ``get``\ 
 and \ ``set``\ .
 


db_value
 
 Returns a string representation of the field that the backend can understand.
 
 In normal case, returns simply the value of the field. Field types where this is
 not correct should override the method.
 


get_field_name
 
 Returns the name under which the field is stored within an Ella object.
 
 The name must have been stored to the field_name property of the field
 declaration, which is done automatically if you bind the field to an Ella object
 with \ ``EllaObject.subclass``\  or \ ``EllaObject_subclass.declare_field``\ .
 


get_type
 
 Returns the name of the field type (like \ *text*\  or \ *bool*\ ).
 


set
 
 Sets the field's value to the one provided in the argument and returns the
 previous value.
 
 In case the field got a \ ``validate_value``\  function at declaration, the provided
 value is fed as argument to this validator and the return value is stored.
 
 To really store what you provided, bypassing validation, you can call \ ``val``\ 
 directly. But why would you do that?
 



Defining New Field Types
========================


New field types are defined using the \ ``define_field_type``\  function. This function is
enclosed in the package, so you can only call it here within. Its return value
is the new field type. The only parameter is an object describing the new type.

To describe the new type, you must specify:


1. the name of the type (mandatory),



2. which values a field of this type can have,



3. how this field will serialize itself for the database,



4. how this field will render itself to HTML and



5. what optional additional methods or properties the field will have.



Ad (1): The name of the field type is specified in the \ ``type``\  property. This is
the only mandatory property, and must be a string.

Ad (2): The legal values of a field of this type can be specified in the form
of a validator function. This validator is called whenever a new field instance
is constructed and also when a new value is set to the field using EllaObject's
\ ``set``\  method. The parameter to the validator is the provided value for the
field. The validator is called in the context of the field declaration.

The validator function is specified in the \ ``validate_value``\  property.

If you just want to provide a default value for the case that the field's value
is not provided at all, you can, instead of creating a function, just specify
the \ ``default_value``\  property. Please note that if you specify both
\ ``validate_value``\  and \ ``default_value``\ , then \ ``default_value``\  will be silently
ignored.

If you provide neither \ ``validate_value``\  nor \ ``default_value``\ , then the value
will be left alone and the field will have whatever you provide.

In case of parametrised field declarations, the given parameter is automatically
stored as \ ``field_declaration_parameter``\  in the field declaration. The validator can
therefore access it as \ ``this.field_declaration_parameter``\ . But better still, you can
validate the given parameter at declaration and store the processed parameter
under (a) more descriptive name(s).

To process the declaration parameter, specify the \ ``on_declaration``\  function. It
will get the declaration parameter as argument and will be called in the context
of the declaration (just like \ ``validate_value``\ ).

Ad (3): The \ ``db_value``\  method of a field should return a string that represents
the field's value in a manner that the server API understands. If the default
behavior (simply returning the value) is not appropriate, you should override
this method.

The overriding of field properties in general is done by specifying a
\ ``field_fields``\  object. In this case:


.. code-block:: javascript

     field_fields: { db_value: function() { return _transform(this.get()) } }


Ad (4): Ella objects are \ *Drawable*\ , under the \ ``EllaObject``\  name. To specify a
different template, make the field Drawable anew. This can be done by extending
the \ ``field_fields``\  object by \ ``new Drawable``\ :


.. code-block:: javascript

     field_fields: $.extend({...}, new Drawable({
         name: foo,
         draw_modes: ['field']
     }),


Ad (5): Specify any other methods or properties a field of the newly defined
type should have in the \ ``field_fields``\  object.

A complete example:


.. code-block:: javascript

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



Checking if Something is a Field
================================


JavaScript does not allow to construct callable objects. Since the field
definitions return field constructors, the inheritance hierarchy cannot be
formally kept, so \ ``article.fields.title instanceof Fields.text``\  returns
\ **false**\ .

To compensate for this unfortunate fact, the \ ``Fields.get_type_of``\  function is
provided. It takes as argument any value and in case it is a field instance, it
returns its type constructor. The type name can then be retrieved via the
\ ``typestr``\  property. If the argument is not a field instance, \ ``null``\  is
returned.


.. code-block:: javascript

     Fields.get_type_of(1);   // null
     Fields.get_type_of(article.fields.title);   // Fields.text
     Fields.get_type_of(article.fields.title).typestr;   // "text"


So instead of \ ``$thing instanceof Fields.text``\ , you can write
\ ``Fields.get_type_of($thing) === Fields.text``\ .


