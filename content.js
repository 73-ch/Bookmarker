window.onload = function () {
  console.log('read');
  chrome.runtime.sendMessage({openTab: window.location.href}, function (data) {
    let scrollY = data["scroll"];
    let level = data["level"];
    console.log(data);
    if (level > 1) {
      window.scrollTo(0, scrollY);
    }
  });
};

window.addEventListener('beforeunload', function (event) {
  let scrollY = window.pageYOffset;
  chrome.runtime.sendMessage({closeTab: scrollY}, function (scrollY) {

  });
});