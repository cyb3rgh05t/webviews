// Function to remove active state from buttons globally
function removeActiveStateGlobally() {
  document
    .querySelectorAll('button[type="submit"], button[type="button"]')
    .forEach((button) => {
      button.addEventListener("mouseup", function () {
        // Use mouseup to catch button release, which may better reset active state
        setTimeout(() => {
          button.classList.remove("active");
        }, 100);
      });

      button.addEventListener("mouseleave", function () {
        // Remove active state if the cursor leaves the button area
        button.classList.remove("active");
      });
    });
}

// Run this function on every page load
removeActiveStateGlobally();
// Remove active state from all buttons with type "submit" and "button" immediately after clicking
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('button[type="submit"], button[type="button"]')
    .forEach((button) => {
      button.addEventListener("click", function () {
        // Briefly delay to allow the active state to appear, then remove it
        setTimeout(() => {
          button.classList.remove("active");
        }, 100); // Adjust delay as needed
      });
    });
});

// Select all nav links
const navLinks = document.querySelectorAll('#sidebar .nav-link');

// Add click event to each link
navLinks.forEach(link => {
  link.addEventListener('click', function() {
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to the clicked link
    this.classList.add('active');
  });
});
