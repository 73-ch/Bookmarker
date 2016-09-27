var desktop_bookmarks;
chrome.runtime.onMessage.addListener(
  function(message,sender,sendResponse) {
    if (message.get_bookmark) {
      getBookmark().then(function(bookmarks){
        sendResponse({bookmarks: bookmarks});
      });
    };
    if (message.bookmark_level){
      setBookmarkLevel(message.bookmark_level.bookmark_id, message.bookmark_level.level).then(function(result){
        sendResponse({result: result});
      });
    };
    if (message.getBookmarkLevel){
      getBookmarkLevel(message.getBookmarkLevel.bookmark_id).then(function(result){
        sendResponse({result: result});
      });
    };
    if (message.getStorage){
      getStorage().then(function(result){
        console.log(result);
        sendResponse({result: result});
      });
    };
    return true;
  }
);

function getBookmark(){
  return new Promise(function(resolve, reject){
    chrome.bookmarks.getTree(function(callback){
      console.log(callback);
      var desktop_bookmarks = callback[0].children; // bookmarkの階層が人によって違うかも？
      resolve(desktop_bookmarks);
    });
  });
}

function setBookmarkLevel(bookmark_id, level){
  return new Promise(function(resolve, reject){
    var data = {};
    data[bookmark_id] = level;
    chrome.storage.local.set(data, resolve("success"));
  })
}

function getBookmarkLevel(bookmark_id){
  return new Promise(function(resolve, reject){
    chrome.storage.local.get(bookmark_id, function(bookmark_level){
      resolve(bookmark_level);
      reject("failed");
    })
  })
}

function getStorage(){
  return new Promise(function(resolve,reject){
    chrome.storage.local.get(function(items){
      resolve(items);
    });
  });
}