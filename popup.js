window.onload = function(){
	var container = document.getElementById("container");
	chrome.runtime.sendMessage({get_bookmark: true}, function(response) {
	 	var bookmarks = response.bookmarks;
	  for (var i = 0; i < bookmarks.length; i++) {
	    if (bookmarks[i].url){
	      var link = document.createElement("a");
	      var button = document.createElement("button");

	      link.textContent = bookmarks[i].title;
	      link.href = bookmarks[i].url;
	      sendBookmarkLevel(bookmarks[i].id, Math.floor(Math.random() * 3));
				getBookmarkLevel(bookmarks[i].id).then(function(result){
					var bookmark_level = result;
				});

	      container.appendChild(link);
	    };
	  };
		getStorage().then(function(result){
			var storage = result;
			console.log(storage);
		});
	});
	function sendBookmarkLevel(bookmark_id, level){
		chrome.runtime.sendMessage({bookmark_level: {bookmark_id: bookmark_id, level: level}}, function(response){
			console.log(response);
		})
	}
	function getBookmarkLevel(bookmark_id){
		return new Promise(function(resolve, reject){
			chrome.runtime.sendMessage({getBookmarkLevel: {bookmark_id: bookmark_id}}, function(response){
				resolve(response);
			});
		});
	}
	function getStorage(){
		return new Promise(function(resolve, reject){
			chrome.runtime.sendMessage({getStorage: true}, function(response){
				resolve(response);
			});
		});
	}
}