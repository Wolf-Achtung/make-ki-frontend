// filename: js/config.js
// DEPRECATED: load root config and expose legacy variable.
(function(){
  var s = document.createElement('script');
  s.src = '../config.js'; // ensure root config is loaded
  s.async = false;
  document.currentScript.parentNode.insertBefore(s, document.currentScript);
})();
