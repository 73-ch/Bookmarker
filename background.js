var desktop_bookmarks;
chrome.runtime.onMessage.addListener(
  function(message,sender,sendResponse) {
    console.log(message);
    if (message.greeting == "hello") {
      getBookmark().then(function(bookmarks){
        sendResponse({bookmarks: bookmarks});
      });
      return true;
    };
  }
);

function getBookmark(){
  return new Promise(function(resolve, reject){
    chrome.bookmarks.getSubTree("1", function(callback){
      var desktop_bookmarks = callback[0].children; // bookmarkの階層が人によって違うかも？
      resolve(desktop_bookmarks);
    });
  });
}