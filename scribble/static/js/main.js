require(
    [
        './lib/knockout',
        './lib/underscore',
        './lib/datatables',
        './lib/datatables/datatables.bootstrap',
        './lib/datatables/datatables.knockout.bindings',
        './scribble'
    ],
    function(ko, _undersc, dataTables, dtb, dtkob, scribble) {
        scribble.load_articles = _.bind(require, this, ['./pages/articles']);
        scribble.load_article  = _.bind(require, this, ['./pages/article' ]);
        window.scribble = scribble;
        $(document).trigger('scribble_loaded');
    }
);
