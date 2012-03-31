require(
    [
        './lib/jquery',
        './lib/knockout',
        './lib/underscore',
        './lib/datatables',
        './lib/datatables/datatables.bootstrap',
        './lib/datatables/datatables.knockout.bindings',
        './scribble'
    ],
    function(jq, ko, undersc, dataTables, dtb, dtkob, scribble) {
        $(document).ready(function() {
            function DataGridModel() {
                var self = this;
                
                self.data = ko.observableArray([]);
                
                self.processData = function (data) {
                    self.data(data['objects']);
                };
                
                self.getData = function () {
                    new scribble.Articles.Article().fetch().done( function(objects) {
                        self.data(objects);
                    });
                };
                
                self.getData();
            }
            
            ko.applyBindings(new DataGridModel());
        });
        window.scribble = scribble;
    }
);
