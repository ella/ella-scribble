define(
    [
        '../EllaObject',
        '../EllaObject/Category',
        '../EllaObject/Author',
        '../EllaObject/Source',
        '../EllaObject/Listing',
        '../Fields'
    ],
    function(EllaObject, Category, Author, Source, Listing, Fields) {
        var Article = EllaObject.subclass({
            type: 'article',
            fields: {
                title        : new Fields.text(),
                upper_title  : new Fields.text(),
                created      : new Fields.datetime(),
                updated      : new Fields.datetime(),
                slug         : new Fields.text(),
                description  : new Fields.text(),
                content      : new Fields.text(),
                category     : new Fields.foreign(Category),
                authors      : new Fields.array(Author),
                source       : new Fields.foreign(Source),
                publish_from : new Fields.datetime(),
                publish_to   : new Fields.datetime(),
                url          : new Fields.text(),
                listings     : new Fields.array(Listing)
            }
        });
        return Article;
    }
);
