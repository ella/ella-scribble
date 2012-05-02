.. highlight:: javascript


****
NAME
****


EllaObject -- The parent class for Ella Objects


********
SYNOPSIS
********



.. code-block:: javascript

     // defining the fictitious Joke object
 
     // in Joke.js
     define(
         ['EllaObject', 'Fields', 'EllaObject/Author'],
         function(EllaObject, Fields, Author) {
             var Joke = EllaObject.subclass({
                 type: 'joke',
                 fields: {
                     // id implied
                     author   : new Fields.foreign(Author),
                     invented : new Fields.datetime(),
                     is_funny : new Fields.bool(),
                     content  : new Fields.text()
                 }
             });
             return Joke;
         }
     );
 
     // in main.js
     require(['joke'], function(Joke) {
         var good_joke = new Joke({
             content: 'My mother never saw the irony in calling me a son-of-a-bitch.',
             is_funny: true
         });
         var bad_joke = new Joke({
             author: {
                 name: 'Mia Wallace',
                 slug: 'mia-wallace'
             },
             invented: new Date('1994-10-14'),
             is_funny: false,
             content: "Father tomato says to son tomato: C'mon, ketchup."
         });
         
         good_joke.get('content');
         bad_joke.set('is_funny', true);
         bad_joke.get('author') instanceof scribble.Author; // true
         good_joke.get('invented'); // returns undefined
         good_joke.get('undeclared_key'); // throws an error
         
         // methods for synchronisation with backend; class JokeResource
         // would have to be defined in resources/__init__.py
         good_joke.save()    // sends the object for saving in the database
         .done(callback)
         .fail(callback);
         
         good_joke.fetch() // gets all jokes that match the properties of good_joke
         .done( function(objects) { ... });
         
         good_joke.load() // updates all properties of good_joke to match the DB version
         .done(function() {
             good_joke.get('id');
         });
     });
 
     <!-- display the joke in html -->
     <div data-bind="template: joke.get_template_id()"></div>
     <script>ko.applyBindings({joke: bad_joke})</script>



***********
DESCRIPTION
***********


EllaObject is a de-facto abstract class, i.e. you're not supposed to call the
constructor directly. Instead, use the `EllaObject.subclass`_ method to create
actual object constructors.

An EllaObject has its \ ``fields``\  and \ ``field_declarations``\ .

Field declarations are defined when EllaObject is subclassed. The field
declarations are bound to the inheriting constructor. A field declaration knows
what type it is and what are the legal values for the field.  Field declarations
are constructors of fields. Field declarations are not properties of instances
but of constructors. All objects have automatically the \ ``id``\  field declaration
if you use standard construction methods described here.

Fields represent actual values an Ella object can have. Fields are properties of
field instances. A specific article will have a specific title, for example. An
object should never have a field for which it doesn't have a corresponding field
declaration. This is enforced if you use the provided methods for manipulating
the objects but can be circumvented if you directly manipulate the properties.
This should not be necessary, and if it is, maybe you should file a feature
request or bug report.

A field object itself stores more than just its value. It also keeps track of
its type, of how it can render itself to HTML and other things. The value of the
field is stored in its \ ``val``\  property and it is stored as a Knockout
observable. Hence, to access the value itself, having a field \ ``f``\ , you have to
call \ ``f.val()``\ . To save you from having to say e.g.
\ ``article.fields.title.val()``\  all the time, the `get`_ and `set`_methods are
provided as illustrated in the `SYNOPSIS`_.

For illustration, here is a schema of article Ella object.


.. code-block:: javascript

     scribble.Article
     - is a constructor
     -> has
         field_declarations
         - each is a constructor
     -> returns
         article object
         - instanceof scribble.Article
         - instanceof EllaObject
         -> has
             fields
             - each is constructed with a field_declaration


Drawing EllaObjects
===================


An EllaObject can of course be displayed in HTML. To help you with this,
EllaObject is extended by \ ``Drawable``\ . Refer to the documentation of Drawable
for further details on rendering Ella objects and Fields into HTML.

Unless an Ella object overrides its Drawable capabilities, it can be rendered in
the \ ``detail``\  and \ ``reference``\  modes, \ ``detail``\  being the primary one. The
drawable name is \ ``EllaObject``\ , so the ID of the template is
\ ``js-template-EllaObject-detail``\  and \ ``js-template-EllaObject-reference``\ ,
respectively.

The detail mode is meant to be used for rendering a HTML page dedicated to the
single Ella object, whereas the reference mode is meant to be used when an Ella
object is merely a foreign field of another Ella object.


Instantiating EllaObjects
=========================


An object subclassed from EllaObject using `EllaObject.subclass`_ is a
constructor (i.e. a function) on its own. Use this constructor with the \ ``new``\ 
keyword to instantiate an object. The only parameter to the constructor is the
object with the initial values of the object's fields.


.. code-block:: javascript

     // scribble.Author inherits from EllaObject
     var author = new scribble.Author({
         name: 'John Doe',
         user: {
             username: 'johndoe'
         }
     });


The keys of the provided initialisation object (\ ``name``\  and \ ``user``\  in this
case) should correspond to field declarations. If a key does not have a
corresponding field declaration, a warning is issued and the field is ignored.

The values are fed as arguments to the constructors of the corresponding fields.
Whatever the constructor returns is stored as the value of the object's field.
Hence, the \ ``author``\  object in the above snippet will end up with the \ ``user``\ 
field in the form of a \ ``User``\  object -- not just a plain object like in the
constructor:


.. code-block:: javascript

     author.get('user') instanceof scribble.User;    // returns true



Methods of EllaObject instances
===============================



init
 
 Initializes the fields of an Ella object. This function is called automatically
 when instantiating and Ella object by its constructor.
 
 The only argument is the object defining the values for individual fields.
 Alternatively, if the argument is numeric, it is interpreted as if it were
 \ ``{id: $n}``\  (with \ ``$n``\  being the numeric argument).
 
 See `Instantiating EllaObjects`_.
 


values
 
 Returns a plain object of the properties (like id, title etc) of the object.
 Foreign objects are nested. Useful for inspecting the object as well as for
 sending it to backend.
 


fields_array
 
 Like `values`_, except the values are not in a plain object but in an array of
 {name: ..., value: ...} object instead. Handy for iterating through the values
 with the \ ``foreach``\  directive of Knockout.
 


fetch
 
 Fetches matching objects from backend.
 
 Sends an ajax request for all objects of the same type as the given instance
 (e.g. new scribble.Article().fetch() fetches Articles) filtered by all columns.
 Precisely said, all objects are fetched that have the same field values like
 what you get using the `values`_ method.
 
 Returned is a jQuery promise object, so you can attach \ ``.done()``\ , \ ``.fail()``\ 
 and \ ``.then()``\  callbacks on it, even after the fetching has completed. The
 \ ``.done()``\  callback gets the array of fetched objects as argument.
 
 The filtering functionality is ensured by the backend.
 


load
 
 Updates the JavaScript version of the object to match its backend counterpart.
 
 This method is similar to `fetch`_ in the respect that it reaches for the
 matching object to the server. In contrast to \ ``fetch``\ , though, this method will
 only succeed when exactly one object is found. Therefore, it is advisable to
 call this method on objects that have a unique field set, like ID or slug. When
 the loading succeeds, the object itself is altered to match whatever came from
 the backend. In particular, all fields that were missing are set.
 
 
 .. code-block:: javascript
 
      var user = new scribble.User({ username: 'johndoe' });
      user.load()
      .done( function() {
          alert( "John Doe's ID is " + user.get('id') );
      });
 
 


save
 
 Sends the serialized object to backend for saving into the database.
 
 Any nested objects (like in \ ``foreign``\  or \ ``array``\  fields) are recursively sent
 along. If any such object does not have ID, it is saved first and the operation
 waits until all such nested objects have been saved themselves.
 


get
 
 Get the value of a field.
 
 The only parameter is the name of the field. Returns the actual value -- i.e.
 the unwrapped Knockout observable. If you want to access other information about
 the field, like its type, access the field directly under the \ ``fields``\  property
 of the Ella object..
 


set
 
 Sets the value of a field.
 
 Accepts exactly two parameters: 1) The field name and 2) the new value. The
 value is set in the means of calling the Knockout observable with the new value,
 so that UI and dependent variables can be updated properly.
 
 Do not assign to the field or to its \ ``val``\  property directly unless you
 really know what you are doing. It will most likely break stuff.
 
 Returns the old value, or null if the field has not been set before. Explodes
 when you try to set a field that is not present in field declarations.
 


get_observable
 
 Shortcut for \ ``ella_object.fields[field_name].val``\ .
 
 The only argument is the name of a field. Returns the Knockout observable
 holding the actual value.
 



Non-instance Methods
====================



declare_field
 
 Add a field declaration to the Ella object constructor.
 
 First argument is the field declaration to add. Second argument is the name
 under which the field will be stored. The name is also stored in the declaration
 under the \ ``field_name``\  property.
 
 The function is a method of constructors of EllaObjects.
 
 
 .. code-block:: javascript
 
      scribble.Article.declare_field(
          'reviewer',
          new Fields.foreign(scribble.Author)
      );
 
 


EllaObject.subclass
 
 The factory for defining new Ella objects.
 
 
 .. code-block:: javascript
 
      scribble.Article = EllaObject.subclass({
          type: 'article',
          fields: {
              title: new Fields.text(),
              category: new Fields.foreign(scribble.Category),
              authors: new Fields.array(scribble.Author)
          }
      });
 
 
 EllaObject.subclass returns a constructor for EllaObject instances. It takes as
 parameter a single object that describes the new EllaObject class.
 
 The parameter object must have the \ ``type``\  property set to a plain string
 stating the name of the new EllaObject subclass and the \ ``fields``\  property,
 which must be an object that describes, what the new EllaObject's
 \ ``field_declarations``\  will be. This means, the keys of the \ ``fields``\  nested
 object are names of possible fields the new EllaObject will be able to have and
 its values are field constructors, in normal case created by calling
 \ ``new Fields.$type()``\  (see the documentation for \ ``Fields``\ ).
 
 \ ``EllaObject.subclass``\  is a mere shortcut for creating a new object that
 inherits from \ ``EllaObject``\ . Apart from this, it does some sanity checking and,
 quite importantly, \ **sets the name of each field declaration as its property**\ .
 Please refer to the documentation of \ ``Fields``\  to find out what this implies and
 what measures you should take to compensate for this when you create field
 declarations outside the \ ``EllaObject.subclass``\  function.
 



Internal functions
==================



prepare_for_sending
 
 Takes an EllaObject instance as parameter and traverses through it, looking for
 nested EllaObjects in the fields (like e.g. when an Article object has its
 Category and Authors), and saves those that do not have an ID.
 
 Return value is a promise object that will resolve when all the nested objects
 have been saved.
 
 This function is called automatically by `save`_.
 
 The rationale for this functionality is that when you want to save an object to
 the database, all the related objects must already be present. The
 objects-to-save are identified by absence of ID because you should never invent
 your own ID. They should always be assigned by the DB engine. So if there is an
 ID, you know what DB row you're referring to.
 


send_object
 
 This is the actual sending of a serialized Ella object to the backend for
 saving. The only parameter is the Ella object to save. Return value is the
 jqXHR.
 
 After the object has been successfully saved, the \ ``ella-object-saved``\  event (in
 the \ ``.scribble``\  namespace) is triggered, so you can watch for it:
 
 
 .. code-block:: javascript
 
      $(document).on('ella-object-saved', function(evt, arg) {
          // arg.obj is the EllaObject
          // arg.xhr is the jqXHR
      });
 
 



