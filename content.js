window.onload = function () {
  chrome.runtime.sendMessage({openTab: window.location.href}, function (scrollY) {
    window.scrollTo(0, scrollY ) ;
  });
  chrome.tabs.getCurrent(function (res) {
    console.log(res);
  });
} ;

window.addEventListener('beforeunload', function(event) {
  console.log('read');
  let scrollY = window.pageYOffset;
  chrome.runtime.sendMessage({closeTab: scrollY}, function (scrollY) {
  });
});