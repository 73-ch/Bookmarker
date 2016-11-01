var test = $("#search-results-container");
console.log(test);

var current_tab,// 現在のタブの情報
		all_bookmarks = [],// 全てのブックマークの情報
		selected_content = 0,// 現在選ばれている検索結果の情報
		result_max = 20,// 検索結果の上限(後でuser_settingで変えられるようにする予定)
		result_bookmarks = [],// 検索結果のarray
		result_htmls = [],// 検索結果のhtmlのarray(後でjQueryの配列に)
		all_windows = [],
		all_tabs = [],
		all_projects = [];
window.onload = function(){
	var container = document.getElementById("search-results-container");
	var form = document.getElementById("search-keyword-field");
	var new_bookmark = document.getElementById("add-new-bookmarks-button");

	window.addEventListener("keydown", keyDown, false);
	form.addEventListener("input", searchEvent, false);
	new_bookmark.addEventListener("click", newBookmarkEvent);

	getBookmarkAll().then(function (bookmarks) {
		all_bookmarks = bookmarks;
	});
	getCurrentTab().then(function (current) {
		current_tab = current;
	});
	getAllWindow().then(function (windows) {
		all_windows = windows;
		getAllTabs(all_windows, all_tabs);
	});
	getAllProject().then(function (projects) {
		if (projects){
			all_projects = projects;
		}else{
			all_projects = [];
		}
	});
};

function keyDown(e) {
	if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
		if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4') { //levels
			var bookmark = getBookmarkUrl(all_bookmarks, current_tab.url);
			if (bookmark) {
				sendBookmarkLevel(bookmark.id, e.key);
			}else {
				newBookmark(current_tab.title, current_tab.url, e.key).then(function (result) {
					console.log(result);
				});
			}
			window.close();
		}else if (e.keyCode == 80){ //80 = p
			let name = document.getElementById("search-keyword-field").value;
			newProject(name, current_tab.windowId);
			e.preventDefault();
		}
	}
	if (e.keyCode == 13) { //13 = enter
		var result = result_bookmarks[selected_content];
		if(result){
			if (result.tab){
				openTab(result);
			}else if(result.bookmark) {
				createTab(result.url, e.shiftKey);
			}else if(result.project){
				openProject(result.id);
			}
			e.preventDefault();
		}
	}else if (e.keyCode == 9 || e.keyCode == 40){ //9 = tab, 40 = down arrow
		$(result_htmls[selected_content]).toggleClass("selected", false);// それまでに選択されていたものから"selected"を削除
		if (selected_content <= result_bookmarks.length){
			var selected_element = document.getElementsByClassName("sr-entry")[selected_content];
			selected_content++;
		}else{
			selected_content = 0;
		}// 選択されるobjectを変える

		$(result_htmls[selected_content]).toggleClass("selected", true);// 新しく選択されたobjectに"selected"をつける
	}else if (e.keyCode == 38){ //38 = up arrow
		$(result_htmls[selected_content]).toggleClass("selected", false);
		if (selected_content > 0){
			selected_content--;
		}else{
			selected_content = result_bookmarks.length;
		}
		$(result_htmls[selected_content]).toggleClass("selected", true);
	}
}

function searchEvent(e) {
	selected_content = 0;
	var container = $("#search-results-container");
	while(container.firstChild) container.removeChild(container.firstChild);
	var keyword = document.getElementById("search-keyword-field").value;
	result_bookmarks = [];
	result_htmls = [];
	if (all_tabs.length > 0)searchTabName(all_tabs, keyword, result_bookmarks);
	if (result_bookmarks.length <= result_max && all_projects.length > 0) searchProjectName(all_projects, keyword, result_bookmarks);
	if (result_bookmarks.length <= result_max) searchBookmarkName(all_bookmarks, keyword, result_bookmarks);
	if (result_bookmarks.length <= result_max) searchBookmarkUrl(all_bookmarks, keyword, result_bookmarks);
	for(var i = 0; i < result_bookmarks.length; i++){
		// *ここから


	  // bookmarkとかを格納するdiv
	  var result = document.createElement("div");// これを最初からjQueryのobjectでやる
    result.setAttribute("class", "result");
    if (result_bookmarks[i].tab){
      result.setAttribute("class", "tab sr-entry");
    }else if (result_bookmarks[i].bookmark){
      result.setAttribute("class", "bookmark sr-entry");
    }
		var titlediv = document.createElement("div");
		result.appendChild(titlediv);
		// bookmarkのfavicon(projectにはない)
    var favicon = document.createElement("img");
		favicon.setAttribute("class","favicon");
    if (result_bookmarks[i].tab){
      favicon.src = result_bookmarks[i].favIconUrl;
    }else if (result_bookmarks[i].bookmark){
      favicon.src = "http://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(result_bookmarks[i].url);
    }
    titlediv.appendChild(favicon);
    // bookmarkのtitle
		var link = document.createElement("a");
		link.setAttribute("class","searchresult");
		if(!result_bookmarks[i].title) result_bookmarks[i].title = "(no name)";// titleがない場合の代わり
		link.textContent = result_bookmarks[i].title;
		link.href = result_bookmarks[i].url;
    titlediv.appendChild(link);
    // bookmarkのURL(projectにはない)
    if(result_bookmarks[i].tab || result_bookmarks[i].bookmark){
      var url = document.createElement("p");
			url.setAttribute("class","url-text");
      url.textContent = result_bookmarks[i].url;
      result.appendChild(url);
    }


    // *ここまでをjQueryで綺麗にかける



    // htmlのDOM ObjectのresultをjQueryで、jQueryのobjectにしてresult_htmlsに入れてる
		if(i == 0)$(result).toggleClass("selected", true);// 一番最初に選択させておく
		result_htmls.push($(result));
	}
	container.html(result_htmls);
	e.preventDefault();
}

function newBookmarkEvent(e) {
	if (current_tab == null) return;
	newBookmark(current_tab.title, current_tab.url, 2).then(function (result) {
		console.log(result);
	});
}

function createTab(url, new_tab) {
	if(new_tab){
		chrome.tabs.create({url: url}, function (tab) {
			console.log(tab);
		});
	}else{
		chrome.tabs.update(current_tab.id, {url: url}, function (tab) {
			console.log(tab);
			window.close();
		});
	}
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

function getAllProject() {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({getAllProject: true}, function (response) {
			resolve(response);
		});
	});
}

function newProject(name, windowId) {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({newProject: {name: name, windowId: windowId}}, function (response) {
			resolve(response);
		});
	});
}

function searchProjectName(projects, name, result) {
	result = result || [];
	for(let i = 0; i < projects.length; i++){
		let val = projects[i];
		if ((new RegExp(name, 'i')).test(val.title)){
			val.project = true;
			if (result.indexOf(val) < 0)result.push(val);
		}
		if (result.length >= result_max)break;
	}
}

function openProject(project_id) {
	chrome.runtime.sendMessage({openProject: {project_id: project_id}});
}
