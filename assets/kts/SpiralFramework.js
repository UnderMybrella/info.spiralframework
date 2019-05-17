if (typeof kotlin === 'undefined') {
  throw new Error("Error loading module 'SpiralFramework'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'SpiralFramework'.");
}
var SpiralFramework = function (_, Kotlin) {
  'use strict';
  var println = Kotlin.kotlin.io.println_s8jyv4$;
  var asList = Kotlin.org.w3c.dom.asList_kt9thq$;
  var Unit = Kotlin.kotlin.Unit;
  function initialiseForm(id) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2, tmp$_3;
    println('Initialising form with id ' + id);
    var urlSearchParams = (new URL(window.location.href)).searchParams;
    var tmp$_4;
    if ((tmp$_2 = (tmp$_1 = (tmp$_0 = Kotlin.isType(tmp$ = document.forms[id], HTMLFormElement) ? tmp$ : null) != null ? tmp$_0.elements : null) != null ? asList(tmp$_1) : null) != null) {
      var tmp$_5;
      tmp$_5 = tmp$_2.iterator();
      loop_label: while (tmp$_5.hasNext()) {
        var element = tmp$_5.next();
        action$break: do {
          var tmp$_6, tmp$_7, tmp$_8;
          tmp$_7 = Kotlin.isType(tmp$_6 = element, HTMLInputElement) ? tmp$_6 : null;
          if (tmp$_7 == null) {
            break action$break;
          }
          var input = tmp$_7;
          tmp$_8 = urlSearchParams.get(input.name);
          if (tmp$_8 == null) {
            break action$break;
          }
          input.value = tmp$_8;
          println('Set the value of ' + input.name);
        }
         while (false);
      }
      tmp$_4 = Unit;
    }
     else
      tmp$_4 = null;
    (tmp$_3 = tmp$_4) != null ? tmp$_3 : println('Failed to initialise ' + id);
  }
  _.initialiseForm = initialiseForm;
  Kotlin.defineModule('SpiralFramework', _);
  return _;
}(typeof SpiralFramework === 'undefined' ? {} : SpiralFramework, kotlin);

//# sourceMappingURL=SpiralFramework.js.map
