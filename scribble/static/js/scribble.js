define([
    './EllaObject/User',
    './EllaObject/Author',
    './EllaObject/Source',
    './EllaObject/Category',
    './EllaObject/Article',
    './EllaObject/Listing',
    './EllaObject/Site',

    './EllaObject',
    './Fields',
    './Drawable'
], function(User, Author, Source, Category, Article, Listing, Site,  EllaObject, Fields, Drawable) {
    $('.editable .Show').live('dblclick', function(evt) {
        $(evt.target).closest('.editable').addClass('Editation-active');
    });
    $('.editable .Edit button').live('click', function(evt) {
        if (evt.button != 0) return;
        $(evt.target).closest('.editable').removeClass('Editation-active');
    });
    return {
        User: User,
        Author: Author,
        Source: Source,
        Category: Category,
        Article: Article,
        Listing: Listing,
        Site: Site,
        
        _EllaObject: EllaObject,
        _Fields: Fields,
        _Drawable: Drawable
    };
});

/*

=head1 NAME

Scribble -- The JavaScript plumbing for Ella administration

=head1 SYNOPSIS

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

=head1 DESCRIPTION

Scribble is the in-browser admin library for Ella CMS. Its purpose is to make
creation of a specific admin application easy. The reason for its creation was
the fact that several people and/or organisations were using Ella CMS and the
then-current admin tool Newman couldn't please all of them. Instead of writing
an universal one-size-fits-all admin, scribble is meant to be a common base for
different admin application according to needs of each user of Ella.

Scribble provides access to the objects that an editor of an Ella-powered
periodical may want to manipulate, such as articles.

Scribble is written using Require, jQuery, Knockout and Underscore libraries.
The C<require> library enables Scribble and all of its descendant objects to be
defined using C<amd> -- asynchronous module definition. See L</Loading Scribble>.

The Scribble object encapsulates the individual Ella objects -- article, author
etc. For a complete list, see C<_(scribble).keys()> or look into the
C<EllaObject> directory. For the functionality of the objects themselves, see
the documentation for C<EllaObject>.

=head2 Loading Scribble

Scribble should be loaded via C<require> as follows:

    // either
    require(['/path/to/scribble', '/another/module'], function(scribble, mod) {
        ...
    });
    // or
    define(['/path/to/scribble', '/another/module'], function(scribble, mod) {
        ...
    })

However, this is not strictly necessary. Important is that the require library
be loaded and thus the C<require> and C<define> functions present when Scribble
is executed. Same goes for C<jQuery>, C<Underscore> and C<Knockout> libraries.
Scribble expects the C<$>, C<_> and C<ko> global objects to point to there
libraries, respectively.

=cut

*/
