define(['../lib/knockout', '../scribble'], function(ko, scribble) {
    function DataGridModel() {
        var self = this;
        
        self.data = ko.observableArray([]);
        
        self.processData = function (data) {
            self.data(data['objects']);
        };
        
        self.getData = function () {
            new scribble.Article().fetch().done( function(objects) {
                self.data(objects);
            });
        };
        
        self.getData();
    }
    
    ko.applyBindings(new DataGridModel());
});

