window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	chrome.runtime.sendMessage({get_bookmark: true}, function(response) {
	 	var bookmarks = response.bookmarks;
	  for (var i = 0; i < bookmarks.length; i++) {
	    if (bookmarks[i].url){
	      var link = document.createElement("a");
	      var button = document.createElement("button");

				link.setAttribute("class","searchresult"); //added class to search results
	      link.textContent = bookmarks[i].title;
				if (bookmarks[i].title.length > 50) {
					link.textContent = link.textContent.substring(0,50) + " ...";
				};
	      link.href = bookmarks[i].url;
	      sendBookmarkLevel(bookmarks[i].id, Math.floor(Math.random() * 3));
				getBookmarkLevel(bookmarks[i].id).then(function(result){
					var bookmark_level = result;
					console.log(bookmark_level);
				});

	      container.appendChild(link);
	    };
	  };
		getStorage().then(function(result){
			var storage = result;
			console.log(storage);
		});
	});
}
// ブックマークのレベルをstorageに登録するためのメソッド
function sendBookmarkLevel(bookmark_id, level){
	chrome.runtime.sendMessage({bookmark_level: {bookmark_id: bookmark_id, level: level}}, function(response){
		console.log(response);
	})
}
// ブックマークのレベルをstorageから取ってくるメソッド
function getBookmarkLevel(bookmark_id){
	return new Promise(function(resolve, reject){
		chrome.runtime.sendMessage({getBookmarkLevel: {bookmark_id: bookmark_id}}, function(response){
			resolve(response);
		});
	});
}
// storage全体を取ってくるメソッド（他の拡張機能のデータも取ってくる　＊未検証）
function getStorage(){
	return new Promise(function(resolve, reject){
		chrome.runtime.sendMessage({getStorage: true}, function(response){
			resolve(response);
		});
	});
}
