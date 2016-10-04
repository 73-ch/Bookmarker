var current_tab,
		all_bookmarks = [],
		storage;
window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	var form = document.getElementById("search-keyword-field");
	var new_bookmark = document.getElementById("add-new-bookmarks-button");

	window.addEventListener("keydown", keyDown, false)
	form.addEventListener("input", searchEvent, false);
	new_bookmark.addEventListener("click", newBookmarkEvent);

	getBookmarkAll().then(function (bookmarks) {
		all_bookmarks = bookmarks;
	});
	getCurrentTab().then(function (current) {
		current_tab = current;
	});
};

function keyDown(e) {
	if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
		if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4') {
			var bookmark = searchBookmarkUrl(all_bookmarks, current_tab.url);
			if (!bookmark) return;
			sendBookmarkLevel(bookmark.id, e.key);
			window.close();
		}
	}
}

function searchEvent(e) {
	var container = document.getElementById("search-results-container");
	while(container.firstChild) container.removeChild(container.firstChild);
	var keyword = document.getElementById("search-keyword-field").value;
	var result_bookmarks = [];
	searchBookmarkName(all_bookmarks, keyword, result_bookmarks);
	for(var i = 0; i < result_bookmarks.length; i++){
		var link = document.createElement("a");
		var button = document.createElement("button");
		link.setAttribute("class","searchresult");
		link.textContent = result_bookmarks[i].title;
		link.href = result_bookmarks[i].url;
		container.appendChild(link);
	}
	e.preventDefault();
}

function newBookmarkEvent(e) {
	if (current_tab == null) return;
	newBookmark(current_tab.title, current_tab.url, 2, 2).then(function (result) {
		console.log(result);
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
		getBookmarkLevel(bookmark_id).then(function (bookmark_level) {
			console.log(bookmark_level);
		});
	});
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
					getBookmarkAll().then(function (bookmarks) {
						console.log(bookmarks);
						all_bookmarks = bookmarks;
						resolve([bookmark, bookmark_level, all_bookmarks]);
					});
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
function searchBookmarkName(bookmarks, name){
	result = result || [];
	bookmarks.forEach(function (val, index, array) {
		if(val.children){
			searchBookmarkName(val.children, name, result);
		} else if(val.url && (new RegExp(name, 'i')).test(val.title) && result.length < 10) {
			result.push(val);
		}
	});
}

function searchBookmarkUrl(bookmarks, url) {
	for (let i = 0; i < bookmarks.length; i++){
		let val = bookmarks[i];
		let result;
		if (val.children){
			result = searchBookmarkUrl(val.children, url);
		} else if(val.url == url){
			result = val;
		}

		if(result) return result;
	}

	return false;
}
