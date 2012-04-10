define(['./lib/knockout', './lib/underscore'], function(ko) {
    function _get_mode(mode, drawable) {
        if (mode === undefined) mode = drawable.default_draw_mode;
        if (mode in drawable.legal_draw_modes) {} else {
            ;;; console.log('got:',mode,'expected one of:',drawable.legal_draw_modes);
            throw 'Illegal draw mode';
        }
        return mode;
    }
    var Drawable = function (conf) {
        var rv = {
            drawable: {
                template_id: {},
                legal_draw_modes: {}
            }
        };
        if ('draw_modes' in conf) {} else {
            conf.draw_modes = [''];
        }
        _( $.makeArray(conf.draw_modes) ).each( function(draw_mode, i) {
            rv.drawable.legal_draw_modes[draw_mode] = true;
            rv.drawable.template_id[draw_mode] = 'js-template-'+conf.name+'-'+draw_mode;
            if (i === 0) rv.drawable.default_draw_mode = draw_mode;
        });
        rv.draw = function(mode) {
            mode = _get_mode(mode, this.drawable);
            var $drawn = $('<div>').attr('data-bind', 'template: "'+this.drawable.template_id[mode]+'"');
            ko.applyBindings(this, $drawn[0]);
            return $drawn;
        };
        rv.get_template_id = function(mode) {
            mode = _get_mode(mode, this.drawable);
            return this.drawable.template_id[mode];
        };
        return rv;
    };
    return Drawable;
});
