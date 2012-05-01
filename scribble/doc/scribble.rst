.. highlight:: javascript


****
NAME
****


Scribble -- The JavaScript plumbing for Ella administration


********
SYNOPSIS
********



.. code-block:: javascript

     <!-- in *.html -->
     <script src="jquery.js"></script>
     <script src="underscore.js"></script>
     <script src="knockout.js"></script>
     <script src="require.js" data-main="main"></script>
 
     // in main.js
     require( [ 'scribble' ], function(scribble) {
         
         var user = new Scribble.User({ username: 'johndoe' });
         user.save()
         .done( function(){
             // John Doe saved at the backend.
             alert('saved user johndoe')
         } );
         
         // ... later ...
         var user = new Scribble.User({ username: 'johndoe' });
         user.load()
         .done( function() {
             // Will show John Doe's ID and other server-provided fields.
             console.log( user.values() );
         } );
         
         // if you want to play around in JS console
         window.scribble = scribble;
     });



***********
DESCRIPTION
***********


Scribble is the in-browser admin library for Ella CMS. Its purpose is to make
creation of a specific admin application easy. The reason for its creation was
the fact that several people and/or organisations were using Ella CMS and the
then-current admin tool Newman couldn't please all of them. Instead of writing
an universal one-size-fits-all admin, scribble is meant to be a common base for
different admin application according to needs of each user of Ella.

Scribble provides access to the objects that an editor of an Ella-powered
periodical may want to manipulate, such as articles.

Scribble is written using Require, jQuery, Knockout and Underscore libraries.
The \ ``require``\  library enables Scribble and all of its descendant objects to be
defined using \ ``amd``\  -- asynchronous module definition. See Loading Scribble.

The Scribble object encapsulates the individual Ella objects -- article, author
etc. For a complete list, see \ ``_(scribble).keys()``\  or look into the
\ ``EllaObject``\  directory. For the functionality of the objects themselves, see
the documentation for \ ``EllaObject``\ .

Loading Scribble
================


Scribble should be loaded via \ ``require``\  as follows:


.. code-block:: javascript

     // either
     require(['/path/to/scribble', '/another/module'], function(scribble, mod) {
         ...
     });
     // or
     define(['/path/to/scribble', '/another/module'], function(scribble, mod) {
         ...
     })


However, this is not strictly necessary. Important is that the require library
be loaded and thus the \ ``require``\  and \ ``define``\  functions present when Scribble
is executed. Same goes for \ ``jQuery``\ , \ ``Underscore``\  and \ ``Knockout``\  libraries.
Scribble expects the \ ``$``\ , \ ``_``\  and \ ``ko``\  global objects to point to there
libraries, respectively.


