window.addEventListener('beforeunload', function(event) {
  console.log('read');
  let scrollY = window.pageYOffset;
  console.log(scrollX);
  chrome.runtime.sendMessage({closeTab: scrollY}, function (scrollY) {
    console.log(scrollY);
  });
});

window.onload = function () {
  chrome.runtime.sendMessage({openTab: window.location.href}, function (scrollY) {
    console.log(scrollY);
    window.scrollTo( 0,scrollY ) ;
  });
};