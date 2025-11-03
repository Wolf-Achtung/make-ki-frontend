/* Prefill/Draft (safe) – keine Server-Drafts mehr; optionales Seeding aus ?b=<id> */
(function(){
  "use strict";
  function apiBase(){
    try{
      var meta = document.querySelector('meta[name="api-base"]');
      return (meta && meta.content) || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '/api';
    } catch(_) { return '/api'; }
  }
  var params = new URLSearchParams(location.search);
  var bid = params.get('b') || params.get('briefing_id');
  if(!bid){ return; }
  try{
    fetch(apiBase() + '/briefings/' + encodeURIComponent(bid), { credentials:'include' })
      .then(function(res){ return res.ok ? res.json() : null; })
      .then(function(j){
        if(j && j.briefing && j.briefing.answers){
          try{ localStorage.setItem('autosave_form_data', JSON.stringify(j.briefing.answers)); }catch(_){}
          try{ localStorage.setItem('autosave_form_step', "0"); }catch(_){}
        }
      }).catch(function(){});
  }catch(_){}
})();