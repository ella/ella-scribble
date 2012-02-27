define(['./Fields', './lib/knockout', './lib/jquery', './lib/underscore'], function(Fields, ko) {
    var EllaObject = function() {
        this.fields = {};
        this.fields.id = Fields.id;
        this.init = function(arg) {
            var vals = {}
            for (var k in arg) {
                if (this.fields[k]) {
                    vals[k] = new this.fields[k](arg[k]);
                }
                else {
                    ;;; console.log('unexpected field', k, arg[k]);
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
        return this;
    };
    return EllaObject;
});
