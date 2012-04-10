define([
    './Auth/User',
    './Core/Author',
    './Core/Source',
    './Core/Category',
    './Articles/Article',
], function(User, Author, Source, Category, Article) {
    $('.editable .Show').live('dblclick', function(evt) {
        $(evt.target).closest('.editable').addClass('Editation-active');
    });
    $('.editable .Edit button').live('click', function(evt) {
        if (evt.button != 0) return;
        $(evt.target).closest('.editable').removeClass('Editation-active');
    });
    return {
        Auth: {
            User: User
        },
        Core: {
            Author: Author,
            Source: Source,
            Category: Category
        },
        Articles: {
            Article: Article
        }
    };
});
