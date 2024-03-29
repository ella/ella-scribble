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
    equal(fi.get().get_object_type(), 'user', 'Parametrized foreign created matching object');
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
    expect(4);
    var A = scribble.Article;
    equal(A.object_type, 'article', 'Object type matches at constructor');
    deepEqual(
        _.keys(A.field_declarations).sort(),
        [
            'title', 'upper_title', 'created', 'updated', 'slug',
            'description', 'content', 'category', 'authors', 'source',
            'publish_from', 'publish_to', 'url', 'listings', 'id'
        ].sort(),
        'Field declarations list matches'
    );
    var arg = {
        title: 'Maw the Lawn',
        upper_title: "Don't Mawn the Lawn",
        created: '2012-05-18T12:00+0200',
        updated: '2012-05-18T16:00+0200',
        slug: 'maw-the-lawn',
        description: 'An instructive article about lawn mawing',
        content: 'Excuse me sir, would you be so kind to maw the lawn, please?',
        category: 1,
        authors: [1,2],
        source: 1,
        publish_from: '2012-05-20',
        publish_to: '2012-05-25',
        url: 'http://example.com/articles/maw-the-lawn',
        listings: [1,2]
    };
    var a = new A(arg);
    deepEqual(a.values(), $.extend(arg, {
        created: new Date(arg.created).toJSON(),
        updated: new Date(arg.updated).toJSON(),
        category: new scribble.Category(1).values(),
        authors: [
            new scribble.Author(1).values(),
            new scribble.Author(2).values()
        ],
        source: new scribble.Source(1).values(),
        publish_from: new Date(arg.publish_from).toJSON(),
        publish_to: new Date(arg.publish_to).toJSON(),
        listings: [
            new scribble.Listing(1).values(),
            new scribble.Listing(2).values()
        ]
    }), 'Fields set correctly');
    equal(a.get_object_type(), 'article', 'Object type matches at instance');
});

test('Author', function() {
    expect(2);
    var arg = {
        user: {username: 'johndoe'},
        name: 'John Doe',
        slug: 'john-doe',
        description: 'Anonymous man',
        text: 'Lorem ipsum',
        email: 'johndoe@example.com'
    };
    var a = new scribble.Author(arg);
    deepEqual(a.values(), arg, 'Fields set correctly');
    equal(a.get_object_type(), 'author', 'Object type matches');
});

test('Category', function() {
    expect(2);
    var arg = {
        title: 'Good Stuff',
        description: 'no bad stuff',
        content: 'Yoghurt, Cake, Steak',
        template: '<h1>{{ content }}</h1>',
        slug: 'good-stuff',
        site: { domain_name: 'example.com' },
        app_data: '{"foo":[1,2]}',
        parent_category: {
            title: 'All stuff',
            parent_category: 2
        }
    };
    var c = new scribble.Category(arg);
    arg.parent_category.parent_category = {id:2};
    deepEqual(c.values(), arg, 'Fields set correctly');
    equal(c.get_object_type(), 'category', 'Object type matches');
});

test('User', function() {
    expect(2);
    var arg = {
        username: 'johndoe',
        password: 'b8wl$fRr'
    };
    var u = new scribble.User(arg);
    deepEqual(u.values(), arg, 'Fields set correctly');
    equal(u.get_object_type(), 'user', 'Object type matches');
});


module('Drawable');

test('Simple use', function() {
    expect(1);
    var Drawable = scribble._Drawable;
    $('#qunit-fixture').html('\
        <script type="text/html" id="js-template-object-normal">\
            <h1>This object says:</h1>\
            <p class="msg" data-bind="text: message"></p>\
        </script>'
    );
    var obj = {message: 'Hello World!'};
    $.extend(obj, new Drawable({
        name: 'object',
        draw_modes: ['normal']
    }));
    $('#qunit-fixture').append( obj.draw() );
    equal($('#qunit-fixture .msg').text(), 'Hello World!', 'Template rendered');
});

test('Complex use', function() {
    expect(3);
    var Drawable = scribble._Drawable;
    $('#qunit-fixture').html('\
        <script type="text/html" id="js-template-album-detail">\
            <h1 class="album-title">\
                Album\
                <span data-bind="text: title"></span>\
                by\
                <span data-bind="text: author"></span>\
            </h1>\
            <ol data-bind="foreach: tracks">\
                <li data-bind="template: $data.get_template_id(\'list_item\')"></li>\
            </ol>\
        </script>\
        \
        <script type="text/html" id="js-template-track-list_item">\
            <label data-bind="text: title"></label>\
            <a data-bind="click: function(){$data.draw(\'detail\').appendTo($(\'#track-detail\').empty());}">\
                show detail\
            </a>\
        </script>\
        \
        <script type="text/html" id="js-template-track-detail">\
            <h1 data-bind="text: title"></h1>\
            <p>lyrics by <span data-bind="text: lyrics"></span></p>\
        </script>\
        \
        <div id="track-detail"></div>'
    );
    
    var tracks = [
        { title: 'As I Am',                 lyrics: 'John Petrucci' },
        { title: 'This Dying Soul',         lyrics: 'Mike Portnoy'  },
        { title: 'Endless Sacrifice',       lyrics: 'John Petrucci' },
        { title: 'Honour Thy Father',       lyrics: 'Mike Portnoy'  },
        { title: 'Vacant',                  lyrics: 'James LaBrie'  },
        { title: 'Stream of Consciousness', lyrics: ''              },
        { title: 'In the Name of God',      lyrics: 'John Petrucci' }
    ];
    var album = {
        author: 'Dream Theater',
        title: 'Train of Thought',
        tracks: tracks
    };
    
    $.extend(album, new Drawable({
        name: 'album',
        draw_modes: ['detail']
    }));
    _(tracks).each(function(track) {
        $.extend(track, new Drawable({
            name: 'track',
            draw_modes: ['detail', 'list_item']
        }));
    });
    
    album.draw('detail').appendTo('#qunit-fixture');
    
    equal(
        $.trim($('#qunit-fixture .album-title').text().replace(/ +/g, ' ')),
        'Album Train of Thought by Dream Theater',
        'Album name'
    );
    $('#qunit-fixture a').eq(2).click();
    equal($('#qunit-fixture #track-detail h1').text(), 'Endless Sacrifice', 'Track detail name');
    equal($('#qunit-fixture #track-detail p').text(), 'lyrics by John Petrucci', 'Track detail lyrics by');
});
