window.onload = function(){
	var container = document.getElementById("container");
	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	 	console.log(response);
	 	var bookmarks = response.bookmarks;
	  for (var i = 0; i < bookmarks.length; i++) {
	    if (bookmarks[i].url){
	      var link = document.createElement("a");
	      var button = document.createElement("button");

	      link.textContent = bookmarks[i].title;
	      link.href = bookmarks[i].url;

	      container.appendChild(link);
	    };
	  };
	});
}