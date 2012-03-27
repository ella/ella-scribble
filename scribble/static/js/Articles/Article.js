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
            this.object_type = 'article';
            this.fields.title        = new Fields.text();
            this.fields.upper_title  = new Fields.text();
            this.fields.updated      = new Fields.datetime();
            this.fields.slug         = new Fields.text();
            this.fields.description  = new Fields.text();
            this.fields.content      = new Fields.text();
            this.fields.category     = new Fields.foreign(Category);
            this.fields.authors      = new Fields.array();
            this.fields.source       = new Fields.foreign(Source);
            this.fields.publish_from = new Fields.datetime();
            this.fields.publish_to   = new Fields.datetime();
            return this.init(arg);
        };
        Article.prototype = new EllaObject();
        Article.prototype.constructor = Article;
        return Article;
    }
);
