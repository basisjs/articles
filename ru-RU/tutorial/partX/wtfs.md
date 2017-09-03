autodelagate - ??

var myForm = new FormContent({
      disabled: Value.factory('targetChanged', function(form){ // disable if no target
        return !form.target;
      }),
      autoDelegate: true,         // delegate parent

-------------
