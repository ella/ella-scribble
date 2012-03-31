define([
    './Auth/User',
    './Core/Author',
    './Core/Source',
    './Core/Category',
    './Articles/Article'
], function(User, Author, Source, Category, Article) {
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
        },
        I_am_scribble: true
    };
});
