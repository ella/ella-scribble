define(
    [
        '../EllaObject',
        '../Core/Category',
        '../Core/Author',
        '../Core/Source',
        '../Fields'
    ],
    function(EllaObject, Category, Author, Source, Fields) {
        var Article = EllaObject.subclass({
            type: 'article',
            fields: {
                title:       { type: Fields.text },
                upper_title: { type: Fields.text },
                created:     { type: Fields.datetime },
                updated:     { type: Fields.datetime },
                slug:        { type: Fields.text },
                description: { type: Fields.text },
                content:     { type: Fields.text },
                category: {
                    type: Fields.foreign,
                    construction_arg: Category
                },
                authors: {
                    type: Fields.array,
                    construction_arg: Author
                },
                source: {
                    type: Fields.foreign,
                    construction_arg: Source
                },
                publish_from: { type: Fields.datetime },
                publish_to:   { type: Fields.datetime },
                url:          { type: Fields.text     }
            }
        });
        return Article;
    }
);
