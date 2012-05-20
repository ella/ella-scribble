/*

=head1 NAME

Drawable -- a mixin to let things render into HTML

=head1 SYNOPSIS

    // in JS
    obj = {message: 'Hello World!'};
    $.extend(obj, new Drawable({
        name: 'object',
        draw_modes: ['normal']
    }));
    $('body').append( obj.draw() );

    <!-- in HTML -->
    <script type="text/html" id="js-template-object-normal">
        <h1>This object says:</h1>
        <p data-bind="text: message"></p>
    </script>



    // in JS
    tracks = [
        { title: 'As I Am',         lyrics: 'John Petrucci' },
        { title: 'This Dying Soul', lyrics: 'Mike Portnoy'  },
        ...
    ];
    album = {
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
    
    album.draw('detail').appendTo('body');
    
    
    <!-- in HTML -->
    <script type="text/html" id="js-template-album-detail">
        <h1>
            Album
            <span data-bind="text: title"></span>
            by
            <span data-bind="text: author"></span>
        </h1>
        <ol data-bind="foreach: tracks">
            <li data-bind="template: $data.get_template_id('list_item')"></li>
        </ol>
    </script>
    
    <script type="text/html" id="js-template-track-list_item">
        <label data-bind="text: title"></label>
        <a data-bind="click: function() { $data.draw('detail').appendTo($('#track-detail').empty()); }">
            show detail
        </a>
    </script>
    
    <script type="text/html" id="js-template-track-detail">
        <h1 data-bind="text: title"></h1>
        <p>lyrics by <span data-bind="text: lyrics"></span></p>
    </script>
    
    <div id="track-detail"></div>

=head1 DESCRIPTION

The Drawable class is a bridge between JavaScript objects and Knockout
templates.

The C<Drawable> constructor accepts one parameter -- an object that should
contain C<name> string and C<draw_modes> array of strings.

Providing a name C<NAME> and draw modes C<MODE1> and C<MODE2> binds the object
with templates, whose IDs are:

=over 4

=item C<js-template-NAME-MODE1>

=item C<js-template-NAME-MODE2>

=back

You can then L</draw> the object in any of the modes, which will return a div
with the expanded template in it. The Knockout model binding for the template
expansion is the object itself, so you can refer to its properties simply by
their names and to the object itself under the C<$data> identifier.

=head2 Methods

=over 4

=cut

*/
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
        var rv = this;
        
        rv.drawable = {
            template_id: {},
            legal_draw_modes: {}
        };
        
        if ('draw_modes' in conf) {} else {
            conf.draw_modes = [''];
        }
        _( $.makeArray(conf.draw_modes) ).each( function(draw_mode, i) {
            rv.drawable.legal_draw_modes[draw_mode] = true;
            rv.drawable.template_id[draw_mode] = 'js-template-'+conf.name+'-'+draw_mode;
            if (i === 0) rv.drawable.default_draw_mode = draw_mode;
        });
        
        return rv;
    };

    Drawable.prototype = {
/*

=item draw

Expands the template bound with the object and given draw mode in the context of
the object.

Accepts a draw mode as parameter. If no mode is given, then the first of defined
draw modes is used.

Returned is a jQuery-wrapped div element whose content is the expanded template.

The template is sought by ID of the format C<js-template-$name-$mode> where
C<$name> is the name you provided at Drawable construction.

=cut

*/
        draw: function(mode) {
            mode = _get_mode(mode, this.drawable);
            var $drawn = $('<div>').attr('data-bind', 'template: "'+this.drawable.template_id[mode]+'"');
            ko.applyBindings(this, $drawn[0]);
            return $drawn;
        },
/*

=item get_template_id

Returns the ID of the template that would be used for drawing in given draw
mode. Accepts a draw mode as parameter.

This function is most useful in templates when you want to draw a template of a
nested object.


=cut

*/
        get_template_id: function(mode) {
            mode = _get_mode(mode, this.drawable);
            return this.drawable.template_id[mode];
        },
/*

=item set_mode

Binds a draw mode with a template ID. Adds the draw mode if not present.
Overrides old template ID otherwise. Returns previous template ID bound with
given mode.

This function serves to change template binding of an already-drawable object.
Information about defined draw modes and corresponding template IDs is stored in
the C<drawable> property of the object, so if you extend an object twice with
two different Drawables, then the second one will overwrite the previous one,
not keeping the previous draw modes -- hence the need for this method.

=back

=cut

*/
        set_mode: function(mode, template_id) {
            this.drawable.legal_draw_modes[mode] = true;
            var old_template_id = this.drawable.template_id[mode];
            this.drawable.template_id[mode] = template_id;
            return old_template_id;
        }
    };
    Drawable.prototype.constructor = Drawable;
    return Drawable;
});
