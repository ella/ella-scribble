define([
    './Auth/User',
    './Core/Author',
    './Core/Source',
    './Articles/Article'
], function(User, Author, Source, Article) {
    return {
        Auth: {
            User: User
        },
        Core: {
            Author: Author,
            Source: Source
        },
        Articles: {
            Article: Article
        },
        I_am_scribble: true
    };
});
