$(document).ready(function () {
  console.log("views.js: Initializing view change script...");

  // Function to load a view and save it in local storage
  function loadView(viewUrl) {
    showProgressBar(); // Show progress bar at start of view load
    $("#main-content").load(viewUrl, function (response, status) {
      if (status === "error") {
        $("#main-content").html(
          '<div class="alert alert-danger">Failed to load the view.</div>'
        );
      } else {
        console.log(`views.js: Loaded view: ${viewUrl}`);

        // Conditionally load specific scripts
        if (viewUrl === "sports_manager.php") {
          $.getScript("assets/js/sports_manager.js")
            .done(function () {
              console.log("views.js: sports_manager.js loaded successfully.");
            })
            .fail(function () {
              console.error("views.js: Failed to load sports_manager.js.");
            });
        }
        if (viewUrl === "backdrops.php") {
          // Fetch the backdrop style via AJAX
          $.ajax({
            url: "backdrops.php",
            method: "POST",
            data: { get_backdrop_style: true },
            dataType: "json",
            success: function (data) {
              if (data.success) {
                $.getScript("assets/js/backdrops.js")
                  .done(function () {
                    console.log("views.js: backdrops.js loaded successfully.");
                    initializeBackdropSettings(data.selected); // Pass the retrieved style
                  })
                  .fail(function () {
                    console.error("views.js: Failed to load backdrops.js.");
                  });
              } else {
                console.error(
                  "Failed to retrieve backdrop style:",
                  data.message
                );
              }
            },
            error: function () {
              console.error("views.js: Error fetching backdrop style.");
            },
          });
        }
      }
      hideProgressBar();
    });
    localStorage.setItem("lastView", viewUrl);
  }

  // Handle link clicks and load the selected view
  $("a[data-view]").click(function (event) {
    event.preventDefault();
    var viewUrl = $(this).attr("data-view");
    loadView(viewUrl);
  });

  // Check local storage for the last viewed page
  var lastView = localStorage.getItem("lastView");
  if (lastView) {
    // Load the last view if it exists
    loadView(lastView);
  } else {
    // Otherwise, load the default view (home.php)
    loadView("home.php");
  }
});
