define(['./Drawable', './Fields', './lib/knockout', './lib/jquery', './lib/underscore'], function(Drawable, Fields, ko) {
    var EllaObject = function() {
        this.fields = {};
        this.fields.id = new Fields.id();
        $.extend(this, new Drawable({
            name: 'EllaObject',
            draw_modes: ['detail', 'reference']
        }));
        return this;
    };
    EllaObject.prototype = {
        init: function(arg) {
            var vals = {}
            if ($.isNumeric(arg)) {
                arg = { id: arg };
            }
            for (var k in arg) {
                if (this.fields[k]) {
                    vals[k] = new this.fields[k](arg[k]);
                }
                else {
                    ;;; console.log('warning: unexpected field "' + k + "' while constructing",this);
                }
            }
            this.vals = vals;
            return this;
        },
        vals_array: function() {
            var rv = [];
            _(this.vals).each(function(val, key) {
                rv.push($.extend({}, val, {name: key}));
            });
            return rv;
        },
        values: function() {
            var data = {};
            _(this.vals).each(function(v, k) {
                var val = v.db_value();
                if (val !== undefined) {
                    data[k] = val;
                }
            });
            return data;
        },
        _get_api_url: function() {
            return '/api/r1/'+this.object_type+'/';
        },
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
        load: function(opt) {
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
        },
        save: function() {
            var data = this.values();
            return $.ajax({
                type: 'post',
                url: this._get_api_url(),
                data: JSON.stringify(data),
                headers: {"Content-Type":"application/json"}
            });
        },
        get: function(field_name) {
            return this.vals[field_name].val();
        },
        set: function(field_name, new_provided_value) {
            var new_value = this.fields[field_name].validate_value(new_provided_value);
            if (field_name in this.vals) {
                var observable = this.vals[field_name].val;
                var old_value = observable();
                observable(new_value);
                return old_value;
            }
            else {
                this.vals[field_name] = new this.fields[field_name](new_value);
                return null;
            }
        }
    };
    EllaObject.subclass = function(opt) {
        var subclass = function(arg) {
            var me = this;
            me.object_type = opt.type;
            _(opt.fields).each(function(field, name) {
                me.fields[name] = new field.type(name, field.construction_arg);
            });
            return me.init(arg);
        };
        subclass.prototype = new EllaObject();
        subclass.prototype.constructor = subclass;
        return subclass;
    };
    return EllaObject;
});
