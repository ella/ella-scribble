/*

=head1 NAME

EllaObject -- The parent class for Ella Objects

=head1 SYNOPSIS

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

=head1 DESCRIPTION

EllaObject is a de-facto abstract class, i.e. you're not supposed to call the
constructor directly. Instead, use the L<EllaObject.subclass> method to create
actual object constructors.

An EllaObject has its C<fields> and C<field_declarations>.

Field declarations are defined when EllaObject is subclassed. The field
declarations are bound to the inheriting constructor and copied over to every
instance. A field declaration knows what type it is and what are the legal
values for the field.  Field declarations are constructors of fields. All
instanes of a specific Ella object have the same field declarations. Unless you
hack, that is. For example, the C<Article> Ella object has the C<title> field
declaration of type C<text>. All objects have automatically the C<id> field
declaration if you use standard construction methods described here.

Fields represent actual values an Ella object can have. A specific article will
have a specific title, for example. An object should never have a field for
which it doesn't have a corresponding field declaration. This is enforced if you
use the provided methods for manipulating the objects but can be circumvented if
you directly manipulate the properties. This should not be necessary, and if it
is, maybe you should file a feature request or bug report.

A field object itself stores more than just its value. It also keeps track of
its type, of how it can render itself to HTML and other things. The value of the
field is stored in its C<val> property and it is stored as a Knockout
observable. Hence, to access the value itself, having a field C<f>, you have to
call C<f.val()>. To save you from having to say e.g.
C<article.fields.title.val()> all the time, the L<get> and L<set>methods are
provided as illustrated in the L<SYNOPSIS>.

For illustration, here is a schema of article Ella object.

    scribble.Article
    - is a constructor
    -> returns
        article object
        - instanceof scribble.Article
        - instanceof EllaObject
        -> has
            field_declarations
            - each is a constructor
        -> has
            fields
            - each is constructed with a field_declaration

=head2 Drawing EllaObjects

An EllaObject can of course be displayed in HTML. To help you with this,
EllaObject is extended by C<Drawable>. Refer to the documentation of Drawable
for further details on rendering Ella objects and Fields into HTML.

Unless an Ella object overrides its Drawable capabilities, it can be rendered in
the C<detail> and C<reference> modes, C<detail> being the primary one. The
drawable name is C<EllaObject>, so the ID of the template is
C<js-template-EllaObject-detail> and C<js-template-EllaObject-reference>,
respectively.

The detail mode is meant to be used for rendering a HTML page dedicated to the
single Ella object, whereas the reference mode is meant to be used when an Ella
object is merely a foreign field of another Ella object.

=head2 Instantiating EllaObjects

An object subclassed from EllaObject using L<EllaObject.subclass> is a
constructor (i.e. a function) on its own. Use this constructor with the C<new>
keyword to instantiate an object. The only parameter to the constructor is the
object with the initial values of the object's fields.

    // scribble.Author inherits from EllaObject
    var author = new scribble.Author({
        name: 'John Doe',
        user: {
            username: 'johndoe'
        }
    });

The keys of the provided initialisation object (C<name> and C<user> in this
case) should correspond to field declarations. If a key does not have a
corresponding field declaration, a warning is issued and the field is ignored.

The values are fed as arguments to the constructors of the corresponding fields.
Whatever the constructor returns is stored as the value of the object's field.
Hence, the C<author> object in the above snippet will end up with the C<user>
field in the form of a C<User> object -- not just a plain object like in the
constructor:

    author.get('user') instanceof scribble.User;    // returns true

=head2 Methods of EllaObject instances

=over 4

=cut

*/

define(['./Drawable', './Fields', './lib/knockout', './lib/underscore'], function(Drawable, Fields, ko) {
    var EllaObject = function() {
        this.field_declarations = {};
        this.field_declarations.id = new Fields.id();
        $.extend(this, new Drawable({
            name: 'EllaObject',
            draw_modes: ['detail', 'reference']
        }));
        return this;
    };
    EllaObject.prototype = {
/*

=item init

Initializes the fields of an Ella object. This function is called automatically
when instantiating and Ella object by its constructor.

The only argument is the object defining the values for individual fields.
Alternatively, if the argument is numeric, it is interpreted as if it were
C<{id: $n}> (with C<$n> being the numeric argument).

See L<Instantiating EllaObjects>.

=cut

*/
        init: function(arg) {
            var fields = {}
            if ($.isNumeric(arg)) {
                arg = { id: arg };
            }
            for (var k in arg) {
                if (this.field_declarations[k]) {
                    fields[k] = new this.field_declarations[k](arg[k]);
                }
                else {
                    ;;; console.log('warning: unexpected field "' + k + "' while constructing",this);
                }
            }
            this.fields = fields;
            return this;
        },
/*
        
=item values

Returns a plain object of the properties (like id, title etc) of the object.
Foreign objects are nested. Useful for inspecting the object as well as for
sending it to backend.

=cut

*/
        values: function() {
            var data = {};
            _(this.fields).each(function(v, k) {
                var val = v.db_value();
                if (val !== undefined) {
                    data[k] = val;
                }
            });
            return data;
        },
/*

=item fields_array

Like L<values>, except the values are not in a plain object but in an array of
{name: ..., value: ...} object instead. Handy for iterating through the values
with the C<foreach> directive of Knockout.

=cut

*/
        fields_array: function() {
            var rv = [];
            _(this.fields).each(function(val, key) {
                rv.push($.extend({}, val, {name: key}));
            });
            return rv;
        },
        _get_api_url: function() {
            return '/api/r1/'+this.object_type+'/';
        },
/*

=item fetch

Fetches matching objects from backend.

Sends an ajax request for all objects of the same type as the given instance
(e.g. new scribble.Article().fetch() fetches Articles) filtered by all columns.
Precisely said, all objects are fetched that have the same field values like
what you get using the L<values> method.

Returned is a jQuery promise object, so you can attach C<.done()>, C<.fail()>
and C<.then()> callbacks on it, even after the fetching has completed. The
C<.done()> callback gets the array of fetched objects as argument.

The filtering functionality is ensured by the backend.

=cut

*/
        fetch: function() {
            var me = this;
            var data = me.values();
            $.extend(data, { limit: 0 });
            var promise = new $.Deferred();
            $.ajax({
                type: 'get',
                url: me._get_api_url(),
                data: data
            })
            .done(function(data) {
                var objects = _(data.objects).map(function(o) {
                    var n;
                    try { n = new me.constructor(o); }
                    catch(e) { console.log('chyba',e,me) }
                    return n;
                });
                promise.resolve(objects);
            })
            .fail(promise.reject);
            return promise;
        },
/*

=item load

Updates the JavaScript version of the object to match its backend counterpart.


This method is similar to L<fetch> in the respect that it reaches for the
matching object to the server. In contrast to C<fetch>, though, this method will
only succeed when exactly one object is found. Therefore, it is advisable to
call this method on objects that have a unique field set, like ID or slug. When
the loading succeeds, the object itself is altered to match whatever came from
the backend. In particular, all fields that were missing are set.

    var user = new scribble.User({ username: 'johndoe' });
    user.load()
    .done( function() {
        alert( "John Doe's ID is " + user.get('id') );
    });

=cut

*/
        load: function() {
            var me = this;
            var promise = new $.Deferred();
            me.fetch()
            .done(function(objects) {
                if (objects.length < 1) {
                    return promise.reject('No matching objects in DB');
                }
                if (objects.length > 1) {
                    ;;; console.log('matching objects', objects);
                    return promise.reject('Multiple matching objects in DB');
                }
                $.extend(me,objects[0]);
                return promise.resolve(objects[0]);
            })
            .fail(promise.reject);
            return promise;
        },
/*

=item save

Sends the serialized object to backend for saving into the database.

Any nested objects (like in C<foreign> or C<array> fields) are recursively sent
along. If any such object does not have ID, it is saved first and the operation
waits until all such nested objects have been saved themselves.

=cut

*/
        save: function() {
            var me = this;
            prepare_for_sending(me)
            .done(function() { send_object.call(this,me) });
        },
/*

=item get

Get the value of a field.

The only parameter is the name of the field. Returns the actual value -- i.e.
the unwrapped Knockout observable. If you want to access other information about
the field, like its type, access the field directly under the C<fields> property
of the Ella object..

=cut

*/
        get: function(field_name) {
            if (field_name in this.fields) {
                return this.fields[field_name].val();
            }
            else if (field_name in this.field_declarations) {
                return undefined;
            }
            else {
                throw new NoSuchKeyError(field_name, this);
            }
        },
/*

=item set

Sets the value of a field.

Accepts exactly two parameters: 1) The field name and 2) the new value. The
value is set in the means of calling the Knockout observable with the new value,
so that UI and dependent variables can be updated properly.

B<Never> assign to the field or to its C<val> property directly unless you
really know what you are doing. It will most likely break stuff.

Returns the old value, or null if the field has not been set before. Explodes
when you try to set a field that is not present in field declarations.

=cut

*/
        set: function(field_name, new_provided_value) {
            if (field_name in this.field_declarations) {} else {
                throw new NoSuchKeyError(field_name, this);
            }
            var new_value = this.field_declarations[field_name].validate_value(new_provided_value);
            if (field_name in this.fields) {
                var observable = this.fields[field_name].val;
                var old_value = observable();
                observable(new_value);
                return old_value;
            }
            else {
                this.fields[field_name] = new this.field_declarations[field_name](new_value);
                return null;
            }
        },
/*

=item get_observable

Shortcut for C<ella_object.fields[field_name].val>.

The only argument is the name of a field. Returns the Knockout observable
holding the actual value.

=back

=cut

*/
        get_observable: function(field_name) {
            return this.fields[field_name].val;
        }
    };
/*

=head2 EllaObject.subclass

The factory for defining new Ella objects.

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

The parameter object must have the C<type> property set to a plain string
stating the name of the new EllaObject subclass and the C<fields> property,
which must be an object that describes, what the new EllaObject's
C<field_declarations> will be. This means, the keys of the C<fields> nested
object are names of possible fields the new EllaObject will be able to have and
its values are field constructors, in normal case created by calling
C<new Fields.$type()> (see the documentation for C<Fields>).

C<EllaObject.subclass> is a mere shortcut for creating a new object that
inherits from C<EllaObject>. Apart from this, it does some sanity checking and,
quite importantly, B<sets the name of each field declaration as its property>.
Please refer to the documentation of C<Fields> to find out what this implies and
what measures you should take to compensate for this when you create field
declarations outside the C<EllaObject.subclass> function.

=cut

*/
    EllaObject.subclass = function(opt) {
        if ('type' in opt) {} else {
            ;;; console.log('Wrong parameter to EllaObject:', opt);
            throw 'Type must be specified for new EllaObject';
        }
        if (_.isString(opt.type)) {} else {
            ;;; console.log('Wrong parameter to EllaObject:', opt);
            throw 'Type of new EllaObject must be a string';
        }
        var subclass = function(arg) {
            var me = this;
            
            me.object_type = opt.type;
            
            var fd = me.field_declarations;
            _(opt.fields).each( function(field, name) {
                fd[name] = field;
                field.field_name = name;
            });
            return me.init(arg);
        };
        subclass.prototype = new EllaObject();
        subclass.prototype.constructor = subclass;
        return subclass;
    };
/*

=head2 Internal functions

=over 4

=item prepare_for_sending

Takes an EllaObject instance as parameter and traverses through it, looking for
nested EllaObjects in the fields (like e.g. when an Article object has its
Category and Authors), and saves those that do not have an ID.

Return value is a promise object that will resolve when all the nested objects
have been saved.

This function is called automatically by L<save>.

The rationale for this functionality is that when you want to save an object to
the database, all the related objects must already be present. The
objects-to-save are identified by absence of ID because you should never invent
your own ID. They should always be assigned by the DB engine. So if there is an
ID, you know what DB row you're referring to.

=cut

*/
    function prepare_for_sending(obj) {
        var data = obj.values();
        var requests = [];
        _(_(obj.fields).keys()).each(function(key) {
            var val = obj.get(key);
            if (val instanceof EllaObject) {
                if (val.get('id')) return;
                requests.push( val.save() );
                return;
            }
            if (_.isArray(val)) {
                _(val).each(function(el) {
                    if (el instanceof EllaObject) {
                        requests.push( el.save() );
                    }
                });
                return;
            }
        });
        return $.when.apply($, requests);
    }
/*

=item send_object

This is the actual sending of a serialized Ella object to the backend for
saving. The only parameter is the Ella object to save. Return value is the
jqXHR.

After the object has been successfully saved, the C<ella-object-saved> event (in
the C<.scribble> namespace) is triggered, so you can watch for it:

    $(document).on('ella-object-saved', function(evt, arg) {
        // arg.obj is the EllaObject
        // arg.xhr is the jqXHR
    });

=back

=cut

*/
    function send_object(obj) {
        var xhr = $.ajax({
            type: 'post',
            url: obj._get_api_url(),
            data: JSON.stringify(obj.values()),
            headers: {"Content-Type":"application/json"}
        })
        .done(function() {
            $(document).trigger('ella-object-saved.scribble', {obj: obj, xhr: xhr});
        });
        return xhr;
    }

    return EllaObject;

    function NoSuchKeyError(field_name, target) {
        var error = new Error('No such key "' + field_name + '"');
        error.target = target;
        return error;
    }
});
