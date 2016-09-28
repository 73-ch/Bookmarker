window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	var form = document.getElementById("search-keyword-field");
	var new_bookmark = document.getElementById("add-new-bookmarks-button");

	form.addEventListener("input", searchEvent, false);
	new_bookmark.addEventListener("click", newBookmarkEvent);
};

function searchEvent(e) {
	console.log("read");
	var container = document.getElementById("search-results-container");
	while(container.firstChild) container.removeChild(container.firstChild);
	var keyword = document.getElementById("search-keyword-field").value;
	getBookmarkAll().then(function (result) {
		var bookmarks = [];
		searchBookmark(result, keyword, bookmarks);
		console.log(bookmarks);
		for(var i = 0; i < bookmarks.length; i++){
			var link = document.createElement("a");
			var button = document.createElement("button");
			link.setAttribute("class","searchresult");
			link.textContent = bookmarks[i].title;
			link.href = bookmarks[i].url;
			container.appendChild(link);
		}
	});
	e.preventDefault();
}

function newBookmarkEvent(e) {
	getCurrentTab().then(function (result) {
		newBookmark(result.title, result.url, 2, 2).then(function (result) {
			console.log(result);
		});
	});
}

function getCurrentTab(){
	return new Promise(function (resolve, reject) {
		chrome.tabs.getSelected(null, function(tab){
			resolve(tab);
		});
	});
}

function getBookmarkAll() {
	return new Promise(function (resolve, reject) {
		chrome.runtime.sendMessage({get_bookmark_all: true}, function(response) {
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

function newBookmark(title, url, parent, level) {
	return new Promise(function (resolve, reject) {
		chrome.runtime.sendMessage({newBookmark: {title: title, url: url, parent: parent, level: level}}, function (bookmark) {
			if (bookmark.id){
				getBookmarkLevel(bookmark.id).then(function (bookmark_level) {
					resolve([bookmark, bookmark_level]);
				});
			}
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
function searchBookmark(bookmarks, name, result){
	result = result || [];
	bookmarks.forEach(function (val, index, array) {
		if(val.children){
			searchBookmark(val.children, name, result);
		} else if(val.url && (new RegExp(name, 'i')).test(val.title) && result.length < 10) {
			result.push(val);
		}
	});
}
