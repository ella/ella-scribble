define(['../scribble', '../lib/knockout'], function(scribble, ko) {
    var article_id = /(\d+)\/?/.exec(location.pathname)[1];
    a = new scribble.Articles.Article({id:article_id});
    a.load()
    .done(draw_article);

    function draw_article(a) {
        ko.applyBindings({
            a: a
        }, $('.article-detail')[0]);
        a.draw().appendTo('.article-detail');
    }
});
