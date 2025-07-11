function showNotification(type, message) {
  console.log("Displaying notification:", message, type);

  const notification = document.getElementById("notification");
  if (!notification) {
    console.error("Notification element not found in DOM.");
    return;
  }

  notification.textContent = message; // Sets message safely
  notification.className = "notification"; // Reset class to base
  notification.classList.add(`notification-${type.replace(/\s+/g, "-")}`); // Replace spaces with dashes if any
  notification.style.display = "block";

  // Hide the notification after 5 seconds and reload the page
  setTimeout(() => {
    console.log("Hiding notification after 3 seconds.");
    notification.style.display = "none";
    // location.reload(); // Reload the page
  }, 3000);
}

function showNotificationLogin(type, message) {
  console.log("Displaying notification:", message, type);

  const notificationLogin = document.getElementById("notificationLogin");
  if (!notificationLogin) {
    console.error("Notification element not found in DOM.");
    return;
  }

  notificationLogin.textContent = message;
  notificationLogin.className = "notification-login"; // Reset class
  notificationLogin.classList.add(`notification-${type}`);
  notificationLogin.style.display = "block";

  // Hide the notification after 5 seconds
  setTimeout(() => {
    console.log("Hiding notification after 3 seconds.");
    notificationLogin.style.display = "none";
  }, 3000);
}

function showApiNotification(type, message) {
  console.log("Displaying API Key notification:", message, type);

  const notification = document.getElementById("notificationApi");
  if (!notification) {
    console.error("notificationApi element not found in DOM.");
    return;
  }

  notification.textContent = message;
  notification.className = "notification"; // Reset class to base
  notification.classList.add(`notification-${type.replace(/\s+/g, "-")}`);
  notification.style.display = "block";

  // Hide the notification after 5 seconds and reload the page
  setTimeout(() => {
    console.log("Hiding API Key notification after 3 seconds.");
    notification.style.display = "none";
    location.reload(); // Reload the page
  }, 3000);
}

function showApiErrorNotification(type, message) {
  console.log("Displaying API Error notification:", message, type);

  const notification = document.getElementById("notificationApi");
  if (!notification) {
    console.error("notificationApi element not found in DOM.");
    return;
  }

  notification.textContent = message;
  notification.className = "notification"; // Reset class to base
  notification.classList.add(`notification-${type.replace(/\s+/g, "-")}`);
  notification.style.display = "block";
}

// Check if there is an error parameter in the URL and show error notification
document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "notifications.js loaded with login, api, sports and backdrops notifications"
  ); // Confirm JS file loaded

  const urlParams = new URLSearchParams(window.location.search);
  if (
    urlParams.has("error") &&
    urlParams.get("error") === "invalid_credentials"
  ) {
    console.log("Error parameter detected in URL"); // Debugging line
    showNotificationLogin(
      "error",
      "Invalid username or password. Please try again."
    );
  }
});
