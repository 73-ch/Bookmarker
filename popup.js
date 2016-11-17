var current_tab,// 現在のタブの情報
  all_bookmarks = [],// 全てのブックマークの情報
  selected_content = 0,// 現在選ばれている検索結果の情報
  result_max = 10,// 検索結果の上限(後でuser_settingで変えられるようにする予定)
  results = [],// 検索結果のarray
  result_htmls = [],// 検索結果のhtmlのarray(後でjQueryの配列に)
  all_windows = [],
  all_tabs = [],
  all_projects = [],
  new_project_bookmark = false,
  labels = [],
  frag = ["search", 0],
  all_folders = [];
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

  $('#submit').click(function () {
    selectEvent(false);
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
  getFolders().then(function (folders) {
    all_folders = folders
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
    selectEvent(e.shiftKey);
    e.preventDefault();
  } else if (e.keyCode == 9 || e.keyCode == 40) { //9 = tab, 40 = down arrow
    $("#search-results-container > .selected").toggleClass("selected",false);
    if (selected_content < result_htmls.length - 1) {
      selected_content++;
      // window.scrollTo(0, result_htmls[selected_content].positionY());
      console.log(result_htmls[selected_content]);
      if (labels.indexOf(selected_content) >= 0)selected_content++;
    } else {
      selected_content = 1;
    }// 選択されるobjectを変える
    console.log(selected_content);
    $(result_htmls[selected_content]).toggleClass("selected", true);// 新しく選択されたobjectに"selected"をつける
  } else if (e.keyCode == 38) { //38 = up arrow
    $("#search-results-container > .selected").toggleClass("selected",false);
    if (selected_content > 0) {
      selected_content--;
      if (labels.indexOf(selected_content) >= 0)selected_content--;
    } else {
      selected_content = result_htmls.length - 1;
    }
    $(result_htmls[selected_content]).toggleClass("selected", true);
  }
}

function selectEvent(shift) {
  if (frag[0] == "new_bookmark"){
    createBookmark(frag[1]);
  }else{
    selectResult(shift);
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
    let result = createResult(results[i].type, results[i].title, null, null, i);

    if (i == 0)$(result).toggleClass("selected", true);// 一番最初に選択させておく
    result_htmls.push(result);
  }
  container.html(result_htmls);
}

function selectResult(new_tab) {
  var result = results[selected_content];
  if (result) {
    if (result.type == "tab") {
      openTab(result);
    } else if (result.type == "bookmark") {
      createTab(result.url, new_tab);
    } else if (result.type == "project") {
      if (new_project_bookmark) {
        newBookmark(current_tab.title, current_tab.url, 4, result.id);
        window.close();
      } else {
        openProject(result.id);
      }
    }
  }
}

function searchEvent(e) {
  if (frag[0] != "search")return;
  labels = [];
  selected_content = 1;
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
  let before_type = null;
  for (var i = 0; i < results.length; i++) {
    if (before_type != results[i].type){
      let type_name = $("<h3></h3>", {
        text: results[i].type
      });
      result_htmls.push(type_name);
      labels.push(result_htmls.length - 1);
    }
    if (!results[i].title) results[i].title = "(no name)";

    let result = createResult(results[i].type, results[i].title, results[i].url, results[i].favIconUrl , result_htmls.length);

    if (i == 0)$(result).toggleClass("selected", true);// 一番最初に選択させておく
    result_htmls.push(result);
    before_type = results[i].type;
  }
  for (let i = 0; i < labels.length; i++){
    results.splice(Number(labels[i]), 0, null);
  }
  container.html(result_htmls);
  e.preventDefault();
}

function createResult(type, title, url, favicon_url, i) {
  let classes = "sr-entry";
  if (type == "bookmark")classes += " bookmark";
  if (type == "tab")classes += " tab";
  let result = $("<div></div>", {
    "class": classes,
    on: {
      click: function (e) {
        selectResult(false);
      },
      mouseover: function (e) {
        $("#search-results-container > .selected").not(this).toggleClass("selected",false);
        selected_content = i;
        $(this).toggleClass("selected", true);
      }
    }
  });
  let label_div = $("<div></div>");
  let name = $("<a></a>", {
      text: title,
      href: url,
      "class": "searchresult"
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
  $('#submit')[0].value = "create";
  result_htmls = [];
  var container = $("#search-results-container");
  frag = ["new_bookmark", level];
  results.push(all_folders[level - 1]);
  results = results.concat(all_folders[level - 1].children);
  let type_name = $("<h3></h3>", {
    text: "project"
  });
  result_htmls.push(type_name);
  labels.push(result_htmls.length - 1);
  for (let i = 0; i < results.length; i++) {
    let result = createResult("project", results[i].title, null, null, i);
    result_htmls.push(result);
  }
  selected_content = 1;
  container.html(result_htmls);
  $("#search-keyword-field")[0].value = current_tab.title;
  $(result_htmls[selected_content]).toggleClass("selected", true);
}

function createBookmark(level) {
  let name = $("#search-keyword-field")[0].value;
  let parent = results[selected_content - 1].id;
  var bookmark = getBookmarkUrl(all_bookmarks, current_tab.url);
  if (bookmark) {
    updateBookmark(bookmark.id, name, level, parent);
  } else {
    newBookmark(name, current_tab.url, level, parent).then(function (result) {
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

function updateBookmark(bookmark_id, title, level, parent) {
  chrome.runtime.sendMessage({update_bookmark: {bookmark_id: bookmark_id, title: title, level: level, parent: parent}}, function (response) {
    console.log(response);
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

function getFolders() {
  return new Promise(function (resolve) {
    chrome.runtime.sendMessage({getFolders: true}, function (res) {
      resolve(res);
    });
  });
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
