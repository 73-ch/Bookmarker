var current_tab,
		all_bookmarks = [],
		selected_content = 0,
		result_max = 20,
		storage,
		result_bookmarks = [],
		all_windows = [],
		all_tabs = [];
window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	var form = document.getElementById("search-keyword-field");
	var new_bookmark = document.getElementById("add-new-bookmarks-button");

	window.addEventListener("keydown", keyDown, false);
	form.addEventListener("input", searchEvent, false);
	new_bookmark.addEventListener("click", newBookmarkEvent);

	getBookmarkAll().then(function (bookmarks) {
		console.log(bookmarks);
		all_bookmarks = bookmarks;
	});
	getCurrentTab().then(function (current) {
		current_tab = current;
	});
	getAllWindow().then(function (windows) {
		all_windows = windows;
		console.log(all_windows);
		getAllTabs(all_windows, all_tabs);
		console.log(all_tabs);
	});
};

function keyDown(e) {
	if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
		if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4') {
			var bookmark = getBookmarkUrl(all_bookmarks, current_tab.url);
			if (bookmark) {
				sendBookmarkLevel(bookmark.id, e.key);
			}else {
				newBookmark(current_tab.title, current_tab.url, e.key).then(function (result) {
					console.log(result);
				});
			}
			window.close();
		}
	}
	if (e.keyCode == 13) {
		var result = result_bookmarks[selected_content];
		if(result){
			if (result.tab){
				console.log('read');
				openTab(result);
			}else if(result.bookmark) {
				createTab(result.url);
			}
		}
	}else if (e.keyCode == 9 || e.keyCode == 40){
		console.log(selected_content);
		if (selected_content <= result_bookmarks.length){
			selected_content++;
		}else{
			selected_content = 0;
		}
	}else if (e.keyCode == 38){
		if (selected_content > 0){
			selected_content--;
		}else{
			selected_content = result_bookmarks.length;
		}
	}
}

function searchEvent(e) {
	var container = document.getElementById("search-results-container");
	while(container.firstChild) container.removeChild(container.firstChild);
	var keyword = document.getElementById("search-keyword-field").value;
	result_bookmarks = [];
	searchTabName(all_tabs, keyword, result_bookmarks);
	if (result_bookmarks.length <= result_max) searchBookmarkName(all_bookmarks, keyword, result_bookmarks);
	if (result_bookmarks.length <= result_max) searchBookmarkUrl(all_bookmarks, keyword, result_bookmarks);
	for(var i = 0; i < result_bookmarks.length; i++){
		var link = document.createElement("a");
		var button = document.createElement("button");
		link.setAttribute("class","searchresult");
		if(!result_bookmarks[i].title) result_bookmarks[i].title = "(no name)";
		link.textContent = result_bookmarks[i].title;
		link.href = result_bookmarks[i].url;
		container.appendChild(link);
	}
	e.preventDefault();
}

function newBookmarkEvent(e) {
	if (current_tab == null) return;
	newBookmark(current_tab.title, current_tab.url, 2).then(function (result) {
		console.log(result);
	});
}

function createTab(url) {
	chrome.tabs.create({url: url}, function (tab) {
		console.log(tab);
	});
}

function openTab(tab) {
	console.log(tab);
	chrome.windows.update(tab.windowId, {focused: true}, function (response) {
		chrome.tabs.update(tab.id, {selected: true});
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

function newBookmark(title, url, level) {
	return new Promise(function (resolve, reject) {
		chrome.runtime.sendMessage({newBookmark: {title: title, url: url, level: level}}, function (bookmark) {
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
function searchBookmarkName(bookmarks, name, result){
	result = result || [];
	for (let i = 0; i < bookmarks.length; i++){
		val = bookmarks[i];
		if(val.url && (new RegExp(name, 'i')).test(val.title)) {
			val.bookmark = true;
			if (result.indexOf(val) < 0)result.push(val);
		}
		if (result.length >= result_max)break;
	}
}

function searchBookmarkUrl(bookmarks, name, result){
	result = result || [];
	for (let i = 0; i < bookmarks.length; i++){
		val = bookmarks[i];
		let url = val.url.replace(/http|https/, "");
		if(url && (new RegExp(name, 'i')).test(url)) {
			val.bookmark = true;
			if (result.indexOf(val) < 0)result.push(val);
		}
		if (result.length >= result_max)break;
	}
}

function getBookmarkUrl(bookmarks, url) {
	for (let i = 0; i < bookmarks.length; i++){
		let val = bookmarks[i];
		let result;
		if(val.url == url){
			result = val;
		}

		if(result) return result;
	}
	return false;
}

function searchTabName(tabs, name, result){
	result = result || [];
	for(let i = 0; i < tabs.length; i++){
		let val = tabs[i];
		if ((new RegExp(name, 'i')).test(val.title)){
			val.tab = true;
			if (result.indexOf(val) < 0)result.push(val);
		}
		if (result.length >= result_max)break;
	}
}

function getAllTabs(windows, result) {
	for(let i = 0; i < windows.length; i++){
		for(let j = 0; j < windows[i].tabs.length; j++){
			result.push(windows[i].tabs[j]);
		}
	}
	return result;
}

function getAllWindow() {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({getAllWindow: true}, function (response) {
			resolve(response);
		});
	});
}
