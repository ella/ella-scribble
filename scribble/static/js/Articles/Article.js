define(
    [
        '../EllaObject',
        '../Core/Category',
        '../Core/Author',
        '../Core/Source',
        '../Fields'
    ],
    function(EllaObject, Category, Author, Source, Fields) {
        var Article = function(arg) {
            this.fields.title        = Fields.text;
            this.fields.upper_title  = Fields.text;
            this.fields.updated      = Fields.datetime;
            this.fields.slug         = Fields.text;
            this.fields.description  = Fields.text;
            this.fields.content      = Fields.text;
            this.fields.category     = Fields.foreign;
            this.fields.authors      = Fields.array;
            this.fields.source       = Fields.foreign;
            this.fields.publish_from = Fields.datetime;
            this.fields.publish_to   = Fields.datetime;
            return this.init(arg);
        };
        Article.prototype = new EllaObject();
        Article.prototype.constructor = Article;
        return Article;
    }
);
