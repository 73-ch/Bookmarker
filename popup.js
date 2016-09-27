window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	var form = document.getElementById("search-keyword");
	form.addEventListener("submit", searchEvent, false);

};

function searchEvent(e) {
	var container = document.getElementById("search-results-container");
	var keyword = document.getElementById("search-keyword-field").value;
	getBookmarkAll().then(function (result) {
		bookmark = searchBookmark(result, keyword);
		console.log(bookmark);
		var link = document.createElement("a");
		var button = document.createElement("button");
		link.setAttribute("class","searchresult");
		link.textContent = bookmark.title;
		link.href = bookmark.url;
		container.appendChild(link);
	});
	e.preventDefault();
}

function getBookmarkAll() {
	return new Promise(function (resolve, reject) {
		chrome.runtime.sendMessage({get_bookmark: true}, function(response) {
			var bookmarks = response.bookmarks;
			resolve(bookmarks);
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

// bookmark検索メソッド
function searchBookmark(bookmarks, name){
	var result;
	bookmarks.forEach(function (val, index, array) {
		if(val.children){
			result = searchBookmark(val.children, name) || result;
		} else if(val.url && val.title == name) {
			result = val;
		}
	});
	// console.log(result);
	return result;
}