console.log("sports_manager.js: Script loaded, initializing...");

// Immediately initialize sports selector on script load
initializeSportsSelector();

function initializeSportsSelector() {
  console.log("sports_manager.js: Initializing sports selector...");
  fetchSports();

  const sportsDropdown = $("#sports");
  const countriesDropdown = $("#countries");
  const leaguesDropdown = $("#leagues");

  // Initialize Select2 on each dropdown with default placeholders
  sportsDropdown.select2({
    theme: "bootstrap4",
    placeholder: "Search for Sports...",
    width: "100%",
  });
  countriesDropdown.select2({
    theme: "bootstrap4",
    placeholder: "Search for Countries...",
    width: "100%",
    disabled: true,
  });
  leaguesDropdown.select2({
    theme: "bootstrap4",
    placeholder: "Search for Leagues...",
    width: "100%",
    disabled: true,
  });

  // Event listener for sport selection
  sportsDropdown.on("change", function () {
    console.log("sports_manager.js: Sport selected:", this.value);
    fetchCountries(this.value);
    countriesDropdown.prop("disabled", false).trigger("change.select2"); // Enable and refresh Select2
  });

  // Event listener for country selection
  countriesDropdown.on("change", function () {
    console.log("sports_manager.js: Country selected:", this.value);
    fetchLeagues(this.value);
    leaguesDropdown.prop("disabled", false).trigger("change.select2"); // Enable and refresh Select2
  });

  // Ensure league fields are set on selection
  leaguesDropdown.on("change", setDefaultLeagueValues);

  // Form submission event listener
  const sportsForm = document.getElementById("sportsForm");
  if (sportsForm) {
    sportsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log(
        "sports_manager.js: Form submitted, preparing to save selection."
      );
      const formData = new FormData(sportsForm);

      // Check that all fields are filled out
      if (
        !formData.get("sport") ||
        !formData.get("country") ||
        !formData.get("league") ||
        !formData.get("league_id")
      ) {
        showNotification("danger", "Error: All fields are required.");
        return;
      }
      saveSelection(formData);
    });
  } else {
    showNotification("error", "sportsForm element not found.");
  }
}

// Save selection via AJAX and show a notification
function saveSelection(formData) {
  showProgressBar();
  console.log("sports_manager.js: Saving selection with formData:", formData);

  fetch("sports_manager.php", {
    method: "POST",
    body: formData,
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("sports_manager.js: Response received from server:", data);
      if (data.includes("Selection saved successfully")) {
        showNotification("success", "Selection saved successfully");
        reloadSelections();
      } else {
        showNotification("danger", data);
      }
    })
    .catch((error) => {
      console.error("sports_manager.js: Error in saveSelection:", error);
      showNotification("danger", "An error occurred while saving");
    })
    .finally(() => {
      hideProgressBar();
    });
}

// Reload saved selections without triggering a notification
function reloadSelections() {
  console.log("sports_manager.js: Reloading selections...");
  fetch("sports_manager.php?action=fetch_selections")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("savedSelections").innerHTML = html;
      console.log("sports_manager.js: Selections reloaded successfully.");
    })
    .catch((error) => {
      console.error("sports_manager.js: Error loading selections:", error);
      showNotification("error", "Failed to reload selections");
    });
}

// Delete cache with progress bar
function deleteCache() {
  showProgressBar();
  console.log("sports_manager.js: Deleting cache...");
  fetch("sports_manager.php", {
    method: "POST",
    body: new URLSearchParams({ delete_cache: true }),
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("sports_manager.js: Cache delete response received:", data);
      if (data.includes("deleted successfully")) {
        showNotification("success", "Cache deleted successfully");
      } else {
        showNotification("error", data);
      }
    })
    .catch((error) => {
      console.error("sports_manager.js: Error deleting cache:", error);
      showNotification("error", "Error deleting cache");
    })
    .finally(() => {
      hideProgressBar();
    });
}

// Delete a specific selection via AJAX
function deleteSelection(id) {
  console.log("sports_manager.js: Deleting selection with ID:", id);
  if (confirm("Are you sure you want to delete this entry?")) {
    fetch(`sports_manager.php?delete_id=${id}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("sports_manager.js: Delete response received:", data);

        if (data.includes("deleted successfully")) {
          showNotification(
            "success",
            "Selection deleted successfully , reloading now....."
          ); // Show success notification
          reloadSelections(); // Reload the selections without additional notification
        } else {
          showNotification("danger", data); // Show error if deletion failed
        }
      })
      .catch((error) => {
        console.error("sports_manager.js: Error deleting selection:", error);
        showNotification("danger", "Error deleting selection");
      });
  }
}

// Save API Key from TheSportsDB
function saveApiKey() {
  console.log("sports_manager.js: Saving API Key...");
  const apiKey = document.getElementById("api_key").value;

  // Send API key via AJAX
  fetch("sports_manager.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: `api_key=${encodeURIComponent(apiKey)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      // Display notification message based on success or error
      if (data.status === "success") {
        console.log("sports_manager.js: API Key saved successfully...");
        showApiNotification("success", data.message); // Using the new function
      } else {
        console.log(
          "sports_manager.js: An error occurred while saving the API Key.."
        );
        showApiNotification("error", data.message); // Using the new function
      }
    })
    .catch((error) => {
      showApiNotification(
        "error",
        "An error occurred while saving the API Key"
      );
      console.error("Error:", error);
    });
}

// Refresh dropdowns for sports, countries, and leagues
function refreshDropdowns() {
  console.log("sports_manager.js: Refreshing dropdowns...");
  fetchSports();
  fetchCountries(document.getElementById("sports").value);
  fetchLeagues(document.getElementById("countries").value);
}

// Fetch and populate sports dropdown
async function fetchSports() {
  const sportsDropdown = $("#sports");
  const countriesDropdown = $("#countries");
  const leaguesDropdown = $("#leagues");

  try {
    console.log("sports_manager.js: Fetching sports data...");
    const response = await fetch(`/includes/fetch_sports.php`);
    if (!response.ok)
      throw new Error("Network response was not ok " + response.statusText);

    const data = await response.json();
    populateSportsDropdown(data.sports);
  } catch (error) {
    // Set the "Wrong API Key" placeholder for all dropdowns and disable them
    setErrorState();

    console.error("sports_manager.js: Error fetching sports:", error);
    showApiErrorNotification(
      "error",
      "API Key is wrong, error fetching Data from TheSportsDB"
    );
  }
}

// Set "Wrong API Key" placeholder and disable all dropdowns
function setErrorState() {
  const sportsDropdown = $("#sports");
  const countriesDropdown = $("#countries");
  const leaguesDropdown = $("#leagues");

  // Set the error state and placeholder for sports dropdown
  sportsDropdown
    .select2({
      theme: "bootstrap4",
      placeholder: "API Key is wrong, error fetching Sports Data",
      width: "100%",
    })
    .prop("disabled", true)
    .trigger("change.select2"); // Reset to placeholder

  // Set the error state and placeholder for countries dropdown
  countriesDropdown
    .select2({
      theme: "bootstrap4",
      placeholder: "API Key is wrong, error fetching Countries Data",
      width: "100%",
    })
    .prop("disabled", true)
    .trigger("change.select2"); // Reset to placeholder

  // Set the error state and placeholder for leagues dropdown
  leaguesDropdown
    .select2({
      theme: "bootstrap4",
      placeholder: "API Key is wrong, error fetching Leagues Data",
      width: "100%",
    })
    .prop("disabled", true)
    .trigger("change.select2"); // Reset to placeholder
}

// Populate sports dropdown with "Search Sports..." placeholder
function populateSportsDropdown(sports) {
  const sportsDropdown = $("#sports");
  sportsDropdown.empty(); // Clear current options

  // Add placeholder as the first option
  sportsDropdown.append(new Option("Search for Sports...", "", true, false));

  // Add actual sports options
  sports.forEach((sport) => {
    sportsDropdown.append(new Option(sport.strSport, sport.strSport));
  });

  // Re-initialize Select2 without the clear (x) option
  sportsDropdown
    .select2({
      theme: "bootstrap4",
      placeholder: "Search for Sports...",
      width: "100%", // Remove allowClear to disable the "x"
    })
    .val(null)
    .trigger("change.select2"); // Reset to placeholder
}

// Fetch and populate countries based on selected sport
async function fetchCountries(sport) {
  const countriesDropdown = $("#countries")
    .empty()
    .append(new Option("Select Country", ""))
    .prop("disabled", false);
  const leaguesDropdown = $("#leagues")
    .empty()
    .append(new Option("Select League", ""))
    .prop("disabled", true);

  try {
    const response = await fetch(
      `/includes/fetch_countries.php?sport=${encodeURIComponent(sport)}`
    );
    const data = await response.json();
    data.countries.forEach((country) => {
      countriesDropdown.append(new Option(country.name_en, country.name_en));
    });
    countriesDropdown.trigger("change.select2");
  } catch (error) {
    console.error("sports_manager.js: Error fetching countries:", error);
    showNotification("danger", "Error fetching countries");
  }
}

// Fetch and populate leagues based on selected country
async function fetchLeagues(country) {
  const leaguesDropdown = $("#leagues")
    .empty()
    .append(new Option("Select League", ""))
    .prop("disabled", false);
  const selectedSport = $("#sports").val();

  try {
    const response = await fetch(
      `/includes/fetch_leagues.php?country=${encodeURIComponent(
        country
      )}&sport=${encodeURIComponent(selectedSport)}`
    );
    const data = await response.json();

    // Destroy existing Select2 instance on leaguesDropdown to reset placeholder
    leaguesDropdown.select2("destroy");

    // Check if leagues are available
    if (data.countries && data.countries.length > 0) {
      data.countries.forEach((league) => {
        leaguesDropdown.append(new Option(league.strLeague, league.idLeague));
      });
      leaguesDropdown
        .prop("disabled", false)
        .select2({
          theme: "bootstrap4",
          placeholder: "Search for Leagues...",
          width: "100%",
        })
        .trigger("change.select2");
    } else {
      // Set placeholder to "No Leagues available" if no leagues are found
      leaguesDropdown
        .select2({
          theme: "bootstrap4",
          placeholder: "No Leagues available",
          width: "100%",
        })
        .prop("disabled", true)
        .trigger("change.select2");
    }
  } catch (error) {
    console.error("sports_manager.js: Error fetching leagues:", error);
    showNotification("danger", "Error fetching leagues");
  }
}

// Set hidden league values for form submission
function setDefaultLeagueValues() {
  const leaguesDropdown = document.getElementById("leagues");
  const selectedLeague = leaguesDropdown.options[leaguesDropdown.selectedIndex];
  document.getElementById("league_id").value = selectedLeague.value;
  document.getElementById("league_name").value = selectedLeague.textContent;
  console.log(
    "sports_manager.js: Default league values set - ID:",
    selectedLeague.value,
    "Name:",
    selectedLeague.textContent
  );
}
