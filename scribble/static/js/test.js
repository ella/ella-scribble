module('main');

var loaded_event_fired = false;
$(document).on('scribble_loaded', function() { loaded_event_fired = true; });

test('Loading Scribble', function() {
    expect(2);
    ok(scribble, 'Scribble present');
    ok(loaded_event_fired, 'Loaded event fired');
});


module('scribble');

test('Scribble object public props', function() {
    expect(7);
    equal(typeof(scribble.User    ), 'function', 'scribble.User present'    );
    equal(typeof(scribble.Author  ), 'function', 'scribble.Author present'  );
    equal(typeof(scribble.Source  ), 'function', 'scribble.Source present'  );
    equal(typeof(scribble.Category), 'function', 'scribble.Category present');
    equal(typeof(scribble.Article ), 'function', 'scribble.Article present' );
    equal(typeof(scribble.Listing ), 'function', 'scribble.Listing present' );
    equal(typeof(scribble.Site    ), 'function', 'scribble.Site present'    );
});

test('Scribble object private props', function() {
    expect(3);
    equal(typeof(scribble._EllaObject), 'function', 'scribble._EllaObject present');
    equal(typeof(scribble._Fields    ), 'object',   'scribble._Fields present'    );
    equal(typeof(scribble._Drawable  ), 'function', 'scribble._Drawable present'  );
});


module('EllaObject');
var user;

test('EllaObject props', function() {
    user = new scribble.User({ username: 'johndoe' });
    expect(4);
    ok(user instanceof scribble.User, 'inherited from constructor');
    strictEqual(user.constructor, scribble.User, 'constructor matches');
    equal(typeof(user.drawable), 'object', 'ellaObject isa Drawable');
    deepEqual(_.keys(user.fields), ['username'], 'fields are as declared');
});

test('EllaObject methods', function() {
    expect(7);
    deepEqual(user.values(), {username:'johndoe'}, 'values()');
    deepEqual(user.fields_array(), [ $.extend({}, user.fields.username, {name: 'username'}) ], 'fields_array()');
    strictEqual(user.get('id'), undefined, 'get unset field');
    strictEqual(user.set('id', 1), null, 'set() new field');
    strictEqual(user.set('id', 2), 1, 'set() returns previous value');
    strictEqual(user.get('id'), 2, 'get() set field');
    strictEqual(user.get_observable('username')(), user.get('username'), 'get_observable()');
});

test('EllaObject exceptions', function() {
    expect(2);
    raises(function() { user.set('foo', 2) }, 'set() undeclared field');
    raises(function() { user.get('foo')    }, 'get() undeclared field');
});

test('EllaObject backend', function() {
    expect(13);
    stop(6);
    var testuser = new scribble.User({ username: '_test_user' });
    
    function assert_test_object_absence() {
        var promise = new $.Deferred();
        testuser.fetch()
        .done( function(users) {
            if (users.length == 0) {
                promise.resolve();
            }
            else {
                promise.reject();
            }
        });
        return promise;
    }
    assert_test_object_absence()
    .fail(function() {
        start(6);
        throw 'Test user (username: _test_user) already present -- bailing out';
    })
    .done(save_test_object);
    
    function save_test_object() {
        var testuser = new scribble.User({ username: '_test_user' });
        var testuser2 = new scribble.User({ username: '_test_user2' });
        testuser2.save();
        testuser.save()
        .done(function(data) {
            ok(true, 'test object saved');
            ok(testuser.get('id'), 'object got an id by saving');
            equal(testuser.get('username'), data.username, 'save received object with matching field');
        })
        .fail(function() {
            ok(false, 'test object saved');
            ok(false, 'object got an id by saving');
            ok(false, 'save received object with matching field');
        })
        .then(function() {
            start();
            fetch_test_object();
        });
    }
    
    function fetch_test_object() {
        testuser.fetch()
        .done(function(data) {
            ok(true, 'fetch succeeded');
            equal(data.length, 1, 'fetch got 1 object');
            var u = data[0];
            equal(u.get('username'), '_test_user', 'fetched object has unchanged username');
            ok(u.get('id'), 'fetched object has an id');
        })
        .fail(function() {
            ok(false, 'fetch succeeded');
            ok(false, 'fetch got 1 object');
            ok(false, 'fetched object has unchanged username');
            ok(false, 'fetched object has an id');
        })
        .then(function() {
            start();
            load_test_object();
        });
    }
    
    function load_test_object() {
        testuser.load()
        .done(function() {
            ok(true, 'load succeeded');
            ok(testuser.get('id'), 'loaded object has id');
            equal(testuser.get('username'), '_test_user', 'loaded object has unchanged username');
        })
        .fail(function() {
            ok(false, 'load succeeded');
            ok(false, 'loaded object has id');
            ok(false, 'loaded object has unchanged username');
        })
        .then(function() {
            start();
            delete_test_object();
        });
    }
    
    function delete_test_object() {
        testuser.delete()
        .done(function() {
            ok('true', 'deletion succeeded');
        })
        .fail(function() {
            ok('false', 'deletion succeeded');
        })
        .then(function() {
            start();
            check_test_object_disappeared();
        });
    }
    
    function check_test_object_disappeared() {
        new scribble.User({username: '_test_user'}).fetch()
        .done(function(data) {
            equal(data.length, 0, 'deleted object disappeared from DB');
        })
        .fail(function() {
            throw 'Failed fetching deleted object';
        })
        .then(function() {
            start();
            check_test_object2_survived();

        });
    }
    
    function check_test_object2_survived() {
        var testuser2 = new scribble.User({username: '_test_user2'});
        testuser2.fetch()
        .done(function(data) {
            equal(data.length, 1, 'test object2 survived');
        })
        .fail(function() {
            throw 'Failed fetching test object2';
        })
        .then(function() {
            start();
            testuser2.delete();
        });
    }
});

test('EllaObject non-instance methods', function() {
    expect(1);
    var Fields = scribble._Fields;
    scribble.User.declare_field('foo', new Fields.text());
    var testuser = new scribble.User({foo: 'bar'});
    equal(testuser.get('foo'), 'bar', 'declared field present');
});


module('Fields');

test('Fields.text', function() {
    expect(10);
    var Fields = scribble._Fields;
    var fd = new Fields.text(); // field declaration
    var fi = new fd('foo');     // field instance
    strictEqual(fi.constructor, fd, 'field instance constructor is field declaration');
    equal(fi.val(), 'foo', 'val() as getter');
    fi.val('bar');
    equal(fi.val(), 'bar', 'val() as setter');
    equal(fi.get(), 'bar', 'get()');
    equal(fi.set('foo'), 'bar', 'set() returns previous value');
    equal(fi.get(), 'foo', 'set()');
    equal(typeof(fi.drawable), 'object', 'field isa Drawable');
    equal(fi.db_value(), 'foo', 'text serializes to its value');
    equal(fi.get_type(), 'text', 'get_type()');
    
    var u = new scribble.User({username: 'johndoe'});
    equal(u.fields.username.get_field_name(), 'username', 'get_field_name()')
});

test('Fields.bool', function() {
    expect(2);
    var Fields = scribble._Fields;
    var fd = new Fields.bool();
    var fi = new fd(1);
    strictEqual(fi.get(), true, 'Value converted to boolean upon construction');
    fi.set(null);
    strictEqual(fi.get(), false, 'Value converted to boolean upon set');
});

test('Fields.json', function() {
    expect(4);
    var Fields = scribble._Fields;
    var fd = new Fields.json();
    var fi = new fd();
    equal(fi.get(), '{}', 'JSON defaults to {}');
    raises(function() { fi.set('}{') }, 'Invalid JSON throws error');
    raises(function() { fi.set({}) }, 'Non-string rejected');
    json = '{"a":1, "b":"bb"}';
    fi.set(json);
    equal(fi.get(), json, 'Valid JSON string accepted');
});

test('Fields.datetime', function() {
    expect(3);
    var Fields = scribble._Fields;
    var fd = new Fields.datetime();
    var time = 1234567890123
    var fi = new fd(time);
    equal(fi.get().getTime(), time, 'Milliseconds since epoch accepted');
    var d = new Date();
    fi.set(d);
    equal(fi.get().getTime(), d.getTime(), 'Date object accepted');
    raises(function() { fi.set('bla') }, 'Invalid datestring rejected');
});

test('Fields.foreign', function() {
    expect(4);
    var Fields = scribble._Fields;
    var fd = new Fields.foreign();
    var user = new scribble.User(2);
    var fi = new fd(user);
    equal(fi.get().get('id'), 2, 'Unparametrized foreign accepted an ella object');
    fd = new Fields.foreign(scribble.User);
    fi = new fd(user);
    equal(fi.get().get('id'), 2, 'Parametrized foreign accepted a matching ella object');
    raises(function() { fi.set(new scribble.Article) }, 'Parametrized foreign rejected non-matching ella object');
    fi.set(5);
    equal(fi.get().object_type, 'user', 'Parametrized foreign created matching object');
});

test('Fields.array', function() {
    expect(6);
    var Fields = scribble._Fields;
    var fd = new Fields.array();
    var fi = new fd([{},1,2,'drei']);
    deepEqual(fi.get(), [{},1,2,'drei'], 'Unrestricted array');
    fi.set(1);
    deepEqual(fi.get(), [1], 'Array constructed from single element');
    fd = new Fields.array(scribble.User);
    raises(function() { new fd('trash') }, 'Non-matching object rejected');
    raises(function() { new fd([new scribble.User(1), 'trash']) }, 'Array with non-matching object rejected');
    fi = new fd([new scribble.User({username: 'johndoe'})]);
    deepEqual(fi.get()[0].values(), {username: 'johndoe'}, 'Array of matching objects accepted');
    deepEqual(fi.db_value(), [{username: 'johndoe'}], 'Serialisation');
});


module('Ella objects');

test('Article', function() {
    expect(1);
    var A = scribble.Article;
    deepEqual(
        _.keys(A.field_declarations).sort(),
        [
            'title', 'upper_title', 'created', 'updated', 'slug',
            'description', 'content', 'category', 'authors', 'source',
            'publish_from', 'publish_to', 'url', 'listings', 'id'
        ].sort()
    );
});
