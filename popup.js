window.onload = function(){
	var container = document.getElementById("search-results-container"); //changed ID
	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	 	console.log(response);
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

	      container.appendChild(link);
	    };
	  };
	});
}
