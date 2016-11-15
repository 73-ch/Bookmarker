var test = $("#search-results-container");
console.log(test);

var current_tab,// 現在のタブの情報
  all_bookmarks = [],// 全てのブックマークの情報
  selected_content = 0,// 現在選ばれている検索結果の情報
  result_max = 10,// 検索結果の上限(後でuser_settingで変えられるようにする予定)
  results = [],// 検索結果のarray
  result_htmls = [],// 検索結果のhtmlのarray(後でjQueryの配列に)
  all_windows = [],
  all_tabs = [],
  all_projects = [],
  new_project_bookmark = false;
window.onload = function () {
  var container = document.getElementById("search-results-container");
  var form = document.getElementById("search-keyword-field");

  window.addEventListener("keydown", keyDown, false);
  form.addEventListener("input", searchEvent, false);

  $('#level-1, #level-2, #level-3').click(function () {
    newBookmarkEvent($(this).data("level"));
  });

  $('#level-4').click(function () {
    if (new_project_bookmark) {
      new_project_bookmark = false;
      var container = $("#search-results-container");
      results = [];
      result_htmls = [];
      container.html(result_htmls);
    } else {
      createProjectBookmark();
    }
  });

  $(document).on("click", ".search-result", function () {
    var result = results[selected_content];
    if (result) {
      if (result.tab) {
        openTab(result);
      } else if (result.bookmark) {
        createTab(result.url, false);
      } else if (result.project) {
        openProject(result.id);
      }
      e.preventDefault();
    }
  });

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
    console.log(projects);
    if (projects) {
      all_projects = projects;
    } else {
      all_projects = [];
    }
  });
};

function keyDown(e) {
  if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
    if (e.key == '1' || e.key == '2' || e.key == '3') { //levels
      newBookmarkEvent(e.key);
    } else if (e.key == '4') {
      if (new_project_bookmark) {
        new_project_bookmark = false;
        var container = $("#search-results-container");
        results = [];
        result_htmls = [];
        container.html(result_htmls);
      } else {
        createProjectBookmark();
      }
      e.preventDefault();
    } else if (e.keyCode == 80) { //80 = p
      let name = document.getElementById("search-keyword-field").value;
      newProject(name, current_tab.windowId);
      e.preventDefault();
    }
  }

  if (e.keyCode == 13) { //13 = enter
    var result = results[selected_content];
    if (result) {
      if (result.type == "tab") {
        openTab(result);
      } else if (result.type == "bookmark") {
        createTab(result.url, e.shiftKey);
      } else if (result.type == "project") {
        if (new_project_bookmark) {
          newBookmark(current_tab.title, current_tab.url, 4, result.id);
          window.close();
        } else {
          openProject(result.id);
        }
      }
      e.preventDefault();
    }
  } else if (e.keyCode == 9 || e.keyCode == 40) { //9 = tab, 40 = down arrow
    $(result_htmls[selected_content]).toggleClass("selected", false);// それまでに選択されていたものから"selected"を削除
    if (selected_content < results.length - 1) {
      var selected_element = document.getElementsByClassName("sr-entry")[selected_content];
      selected_content++;
      window.scrollTo(0, result_htmls[selected_content]);
    } else {
      selected_content = 0;
    }// 選択されるobjectを変える

    $(result_htmls[selected_content]).toggleClass("selected", true);// 新しく選択されたobjectに"selected"をつける
  } else if (e.keyCode == 38) { //38 = up arrow
    $(result_htmls[selected_content]).toggleClass("selected", false);
    if (selected_content > 0) {
      selected_content--;
    } else {
      selected_content = results.length - 1;
    }
    $(result_htmls[selected_content]).toggleClass("selected", true);
  }
}

function createProjectBookmark() {
  new_project_bookmark = true;

  selected_content = 0;
  var container = $("#search-results-container");
  while (container.firstChild) container.removeChild(container.firstChild);
  var keyword = document.getElementById("search-keyword-field").value;
  results = [];
  result_htmls = [];
  searchProjectName(all_projects, keyword, results);
  for (let i = 0; i < results.length; i++) {
    let result = createResult(results[i].type, results[i].title, null, null);

    if (i == 0)$(result).toggleClass("selected", true);// 一番最初に選択させておく
    result_htmls.push(result);
  }
  container.html(result_htmls);
}

function searchEvent(e) {
  console.log(e);
  selected_content = 0;
  var container = $("#search-results-container");
  while (container.firstChild) container.removeChild(container.firstChild);
  var keyword = document.getElementById("search-keyword-field").value;
  results = [];
  result_htmls = [];
  if (new_project_bookmark) {
    searchProjectName(all_projects, keyword, results);
  } else {
    if (all_tabs.length > 0)searchTabName(all_tabs, keyword, results);
    if (results.length <= result_max && all_projects.length > 0) searchProjectName(all_projects, keyword, results);
    // if (results.length <= result_max && all_projects.length > 0) searchFolders(all_projects, keyword, results);
    if (results.length <= result_max) searchBookmarkName(all_bookmarks, keyword, results);
    if (results.length <= result_max) searchBookmarkUrl(all_bookmarks, keyword, results);
  }
  for (var i = 0; i < results.length; i++) {
    if (!results[i].title) results[i].title = "(no name)";

    let result = createResult(results[i].type, results[i].title, results[i].url, results[i].favIconUrl);

    if (i == 0)$(result).toggleClass("selected", true);// 一番最初に選択させておく
    result_htmls.push(result);
  }
  container.html(result_htmls);
  e.preventDefault();
}

function createResult(type, title, url, favicon_url) {
  let classes = "sr-entry";
  if (type == "bookmark")classes += " bookmark";
  if (type == "tab")classes += " tab";
  let result = $("<div></div>", {"class": classes}),
    label_div = $("<div></div>", {
      on: {
        mouseover: function (e) {
          $(this).toggleClass("selected", true);
          $("#search-results-container > .selected").not(this).toggleClass("selected",false);
        },
        mouseout: function (e) {
          $(this).toggleClass("selected", false);
        }
      }
    }),
    name = $("<a></a>", {
      text: title,
      href: url,
      "class": "url-text search-result"
    });
  let favicon_obj, url_obj;
  if (type == "bookmark" || type == "tab") {
    favicon_obj = $("<img>", {
      src: favicon_url,
      "class": "favicon"
    });
    url_obj = $("<p></p>", {
      text: url,
      "class": "url-text"
    });
  }
  label_div.append(favicon_obj, name);
  result.append(label_div, url_obj);
  return result;
}

function newBookmarkEvent(level) {
  let title = current_tab.title;
  let input = document.getElementById("search-keyword-field").value;
  if (input.length > 0)title = input;
  var bookmark = getBookmarkUrl(all_bookmarks, current_tab.url);
  if (bookmark) {
    sendBookmarkLevel(bookmark.id, level);
  } else {
    newBookmark(title, current_tab.url, level, null).then(function (result) {
      console.log(result);
    });
  }
  window.close();
}

function createTab(url, new_tab) {
  if (new_tab) {
    chrome.tabs.create({url: url}, function (tab) {
      console.log(tab);
    });
  } else {
    chrome.tabs.update(current_tab.id, {url: url}, function (tab) {
      window.close();
    });
  }
}

function openTab(tab) {
  chrome.windows.update(tab.windowId, {focused: true}, function (response) {
    chrome.tabs.update(tab.id, {selected: true});
  });
}

function getCurrentTab() {
  return new Promise(function (resolve, reject) {
    chrome.tabs.getSelected(null, function (tab) {
      resolve(tab);
    });
  });
}

function getBookmarkAll() {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({get_bookmark_all: true}, function (response) {
      var bookmarks = response.bookmarks;
      resolve(bookmarks);
    });
  });
}

// ブックマークのレベルをstorageに登録するためのメソッド
function sendBookmarkLevel(bookmark_id, level) {
  chrome.runtime.sendMessage({bookmark_level: {bookmark_id: bookmark_id, level: level}}, function (response) {
    getBookmarkLevel(bookmark_id).then(function (bookmark_level) {
      console.log(bookmark_level);
    });
  });
}
// ブックマークのレベルをstorageから取ってくるメソッド
function getBookmarkLevel(bookmark_id) {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({getBookmarkLevel: {bookmark_id: bookmark_id}}, function (response) {
      resolve(response);
    });
  });
}

function newBookmark(title, url, level, parent) {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({
      newBookmark: {
        title: title,
        url: url,
        level: level,
        parent: parent
      }
    }, function (bookmark) {
      if (bookmark.id) {
        getBookmarkLevel(bookmark.id).then(function (bookmark_level) {
          getBookmarkAll().then(function (bookmarks) {
            all_bookmarks = bookmarks;
            resolve([bookmark, bookmark_level, all_bookmarks]);
          });
        });
      }
    });
  });
}

// storage全体を取ってくるメソッド（他の拡張機能のデータも取ってくる　＊未検証）
function getStorage() {
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({getStorage: true}, function (response) {
      resolve(response);
    });
  });
}

// bookmark検索メソッド
function searchBookmarkName(bookmarks, name, result) {
  result = result || [];
  for (let i = 0; i < bookmarks.length; i++) {
    val = bookmarks[i];
    if (val.url && (new RegExp(name, 'i')).test(val.title)) {
      val.type = "bookmark";
      val.favIconUrl = "http://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(val.url);
      if (result.indexOf(val) < 0)result.push(val);
    }
    if (result.length >= result_max)break;
  }
}

function searchBookmarkUrl(bookmarks, name, result) {
  result = result || [];
  for (let i = 0; i < bookmarks.length; i++) {
    val = bookmarks[i];
    let url = val.url.replace(/http|https/, "");
    if (url && (new RegExp(name, 'i')).test(url)) {
      val.type = "bookmark";
      val.favIconUrl = "http://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(val.url);
      if (result.indexOf(val) < 0)result.push(val);
    }
    if (result.length >= result_max)break;
  }
}

function getBookmarkUrl(bookmarks, url) {
  for (let i = 0; i < bookmarks.length; i++) {
    let val = bookmarks[i];
    let result;
    if (val.url == url) {
      result = val;
    }

    if (result) return result;
  }
  return false;
}

function searchTabName(tabs, name, result) {
  result = result || [];
  for (let i = 0; i < tabs.length; i++) {
    let val = tabs[i];
    if ((new RegExp(name, 'i')).test(val.title)) {
      val.type = "tab";
      if (result.indexOf(val) < 0)result.push(val);
    }
    if (result.length > result_max)break;
  }
}

function getAllTabs(windows, result) {
  for (let i = 0; i < windows.length; i++) {
    for (let j = 0; j < windows[i].tabs.length; j++) {
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
  for (let i = 0; i < projects.length; i++) {
    let val = projects[i];
    if ((new RegExp(name, 'i')).test(val.title)) {
      val.type = "project";
      if (result.indexOf(val) < 0)result.push(val);
    }
    if (result.length >= result_max)break;
  }
}

function openProject(project_id) {
  chrome.runtime.sendMessage({openProject: {project_id: project_id}});
}
