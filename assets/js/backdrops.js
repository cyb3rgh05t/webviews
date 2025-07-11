document
  .getElementById("backdropForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    showProgressBar(); // Show progress bar at start of form submission
    console.log("Backdrop form submission triggered.");

    const formData = new FormData(this);
    console.log("Form data collected:", Object.fromEntries(formData.entries()));

    fetch("backdrops.php", {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((response) => {
        console.log("Server response received.");
        return response.json();
      })
      .then((data) => {
        console.log("Parsed JSON response:", data);

        // Display notification with appropriate type based on success
        showNotification(data.success ? "success" : "error", data.message);

        if (data.success) {
          console.log("Updating backdrop style display.");
          const alertElement = document.querySelector(".notification-warning");
          if (alertElement) {
            alertElement.innerHTML =
              "The current backdrop style is <strong>" +
              formData.get("backdrop_style").toUpperCase() +
              "</strong>.";
          } else {
            console.warn("Element with class .notification-warning not found.");
          }
        }
      })
      .catch((error) => {
        console.error("Error saving backdrop settings:", error);
        showNotification(
          "error",
          "An error occurred while saving the backdrop settings."
        );
      })
      .finally(() => {
        hideProgressBar(); // Hide progress bar when form submission completes
      });
  });

// Modify deleteCache to use the progress bar
function deleteCache() {
  showProgressBar();
  console.log("Cache deletion initiated.");

  fetch("backdrops.php", {
    method: "POST",
    body: new URLSearchParams({ delete_cache: true }),
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((response) => {
      console.log("Cache deletion response received.");
      return response.json();
    })
    .then((data) => {
      console.log("Parsed JSON response for cache deletion:", data);

      // Display notification based on success
      showNotification(data.success ? "success" : "error", data.message);
    })
    .catch((error) => {
      console.error("Error deleting cache:", error);
      showNotification("error", "An error occurred while deleting the cache.");
    })
    .finally(() => {
      // Hide the progress bar after the action is complete
      hideProgressBar();
    });
}

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    button.blur();
  });
});

function copyToClipboard(inputId) {
  const inputField = document.getElementById(inputId);
  inputField.select();
  document.execCommand("copy");

  // Create custom on-screen popup (toast-style) within the container
  const toast = document.createElement("div");
  toast.textContent = "Copied to clipboard!";
  toast.className = "toast-notification";
  document.getElementById("toast-container").appendChild(toast);

  // Show and hide the toast after 2 seconds
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

function toggleBackdropSettings() {
  const backdropStyle = document.getElementById("backdrop_style").value;
  console.log("Backdrop style selected:", backdropStyle);

  document.getElementById("tmdbSettings").style.display =
    backdropStyle === "tmdb" ? "block" : "none";
  document.getElementById("plexSettings").style.display =
    backdropStyle === "plex" ? "block" : "none";
}

function initializeBackdropSettings(style) {
  const backdropSelect = document.getElementById("backdrop_style");
  if (backdropSelect) {
    backdropSelect.value = style;
    toggleBackdropSettings(); // Immediately show the correct settings section
  } else {
    console.warn("Backdrop select element not found.");
  }
}

$(document).ready(function () {
  // Initialize Select2 for backdrop style
  $("#backdrop_style").select2({
    theme: "bootstrap4",
    placeholder: "Choose your Backdrop Style",
    width: "100%", // Full width to align with label
  });

  // Initialize Select2 for language
  $("#language").select2({
    theme: "bootstrap4",
    width: "100%",
  });

  // Add placeholder to the search input when backdrop_style dropdown opens
  $("#backdrop_style").on("select2:open", function () {
    $(".select2-search__field").attr(
      "placeholder",
      "Search backdrop styles..."
    );
  });

  // Add placeholder to the search input when language dropdown opens
  $("#language").on("select2:open", function () {
    $(".select2-search__field").attr("placeholder", "Search language...");
  });
});
