define(['./Fields', './lib/knockout', './lib/jquery', './lib/underscore'], function(Fields, ko) {
    var EllaObject = function() {
        this.fields = {};
        this.fields.id = new Fields.id();
        this.init = function(arg) {
            var vals = {}
            for (var k in arg) {
                if (this.fields[k]) {
                    vals[k] = new this.fields[k](arg[k]);
                }
                else {
                    throw('unexpected field "' + k + "'");
                }
            }
            this.vals = vals;
            return this;
        };
        this.draw_reference = function() {
            if (!this.vals.id) return null;
            var $input = $('<input data-bind="value: id" type="number">');
            ko.applyBindings({id: this.vals.id.val}, $input[0]);
            return $input;
        };
        this.draw_detail = function() {
            var $detail = $('<div>');
            _(this.vals).each(function(v) {
                v.draw().appendTo($detail);
            });
            return $detail;
        };
        this.save = function() {
            var data = {};
            _(this.vals).each(function(v, k) {
                var val = v.db_value();
                if (val !== undefined) {
                    data[k] = v.db_value();
                }
            });
            $.ajax({
                type: 'post',
                url: '/api/r1/'+this.object_type+'/',
                data: JSON.stringify(data),
                headers:{"Content-Type":"application/json"}
            });
        };
        this.get = function(field_name) {
            return this.vals[field_name].val();
        };
        this.set = function(field_name, new_value) {
            var observable = this.vals[field_name].val;
            var old_value = observable();
            observable(new_value);
            return old_value;
        };
        return this;
    };
    return EllaObject;
});
