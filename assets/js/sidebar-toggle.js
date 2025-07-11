$(document).ready(function () {
  // Toggle sidebar
  $("#toggle-arrow").click(function () {
    $("#sidebar").toggleClass("collapsed");
    $("#main-content").toggleClass("collapsed");
    $("#navbar-content").toggleClass("collapsed");
    $("#footer").toggleClass("collapsed"); // Toggle footer class

    // Toggle logos
    $("#logo-expanded").toggleClass("d-none");
    $("#logo-collapsed").toggleClass("d-none");
  });
});
