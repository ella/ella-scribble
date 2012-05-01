.. highlight:: javascript


****
NAME
****


Drawable -- a mixin to let things render into HTML


********
SYNOPSIS
********



.. code-block:: javascript

     // in JS
     obj = {message: 'Hello World!'};
     $.extend(obj, new Drawable({
         name: 'object',
         draw_modes: ['normal']
     });
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
     });
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
         <a onclick="$data.draw('detail').appendTo($('#track-detail').empty());">
             show detail
         </a>
     </script>
     
     <script type="text/html" id="js-template-track-detail">
         <h1 data-bind="text: title"></h1>
         <p>lyrics by <span data-bind="text: lyrics"></span></p>
     </script>
     
     <div id="track-detail"></div>



***********
DESCRIPTION
***********


The Drawable class is a bridge between JavaScript objects and Knockout
templates.

The \ ``Drawable``\  constructor accepts one parameter -- an object that should
contain \ ``name``\  string and \ ``draw_modes``\  array of strings.

Providing a name \ ``NAME``\  and draw modes \ ``MODE1``\  and \ ``MODE2``\  binds the object
with templates, whose IDs are:


\ ``js-template-NAME-MODE1``\ 



\ ``js-template-NAME-MODE2``\ 



You can then draw the object in any of the modes, which will return a div
with the expanded template in it. The Knockout model binding for the template
expansion is the object itself, so you can refer to its properties simply by
their names and to the object itself under the \ ``$data``\  identifier.

Methods
=======



draw
 
 Expands the template bound with the object and given draw mode in the context of
 the object.
 
 Accepts a draw mode as parameter. If no mode is given, then the first of defined
 draw modes is used.
 
 Returned is a jQuery-wrapped div element whose content is the expanded template.
 
 The template is sought by ID of the format \ ``js-template-$name-$mode``\  where
 \ ``$name``\  is the name you provided at Drawable construction.
 


get_template_id
 
 Returns the ID of the template that would be used for drawing in given draw
 mode. Accepts a draw mode as parameter.
 
 This function is most useful in templates when you want to draw a template of a
 nested object.
 


set_mode
 
 Binds a draw mode with a template ID. Adds the draw mode if not present.
 Overrides old template ID otherwise. Returns previous template ID bound with
 given mode.
 
 This function serves to change template binding of an already-drawable object.
 Information about defined draw modes and corresponding template IDs is stored in
 the \ ``drawable``\  property of the object, so if you extend an object twice with
 two different Drawables, then the second one will overwrite the previous one,
 not keeping the previous draw modes -- hence the need for this method.
 



