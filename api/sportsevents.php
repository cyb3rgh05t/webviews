<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define database paths
$apiKeyDbFile = '../databases/apiKeys.db'; // Separate database for API Key

// Connect to the API key database
$apiKeyDb = new SQLite3($apiKeyDbFile);

// Retrieve API key from the API key database
$API_KEY = $apiKeyDb->querySingle("SELECT api_key FROM api_keys WHERE id = 1");

// Check if API_KEY is empty, and if so, return an error
if (empty($API_KEY)) {
    echo "<p>Error: API Key not found. Please set the API Key first.</p>";
    exit;
}

// Define cache file path
$cacheFile = './cache/sports_cache.json'; // Make sure this directory is writable
$cacheLifetime = 86400; // Cache lifetime in seconds (24 hours)

// Function to fetch events for a specific league ID
function fetchEvents($leagueId)
{
    global $API_KEY;

    // Check if API_KEY is defined
    if (empty($API_KEY)) {
        return [];
    }

    // Construct the URL
    $url = "https://www.thesportsdb.com/api/v2/json/schedule/next/league/{$leagueId}";

    // Initialize cURL
    $ch = curl_init();

    // Set the necessary cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-KEY: ' . $API_KEY
    ]);

    // Execute the cURL request
    $response = curl_exec($ch);

    // Check for cURL errors
    if ($response === false) {
        error_log("cURL Error: " . curl_error($ch));
        curl_close($ch);
        return [];
    }

    // Close the cURL session
    curl_close($ch);

    // Decode the JSON response
    $data = json_decode($response, true);

    // Validate the response
    if (!isset($data['schedule']) || !is_array($data['schedule'])) {
        error_log("Invalid API response or missing 'schedule' key for league ID {$leagueId}");
        return [];
    }

    return $data['schedule']; // Return just the events data
}


function fetchAndCacheEvents($leagues)
{
    global $cacheFile, $cacheLifetime;

    // Check if the cache file exists and is still valid
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheLifetime)) {
        // Load data from cache
        $cachedData = file_get_contents($cacheFile);
        return json_decode($cachedData, true) ?: []; // Ensure it returns an array
    }

    // Cache is not valid, fetch fresh data
    $eventsByDate = [];

    foreach ($leagues as $league) {
        $events = fetchEvents($league['league_id']);
        if ($events) {
            foreach ($events as $event) {
                // Original DateTime object for sorting
                $eventDate = new DateTime($event['dateEvent']);
                $sortableDate = $eventDate->format('Y-m-d'); // Use sortable format

                // Format the display date for output
                $germanDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                $germanMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

                $dayOfWeek = $germanDays[$eventDate->format('w')];
                $dayOfMonth = $eventDate->format('d');
                $month = $germanMonths[$eventDate->format('n') - 1];
                $year = $eventDate->format('Y');
                $formattedDate = "$dayOfWeek, $dayOfMonth. $month $year";

                    $thumbnail = !empty($event['strThumb']) ? $event['strThumb'] : '../assets/images/sports/default.jpg';

                    $eventsByDate[$sortableDate][] = [
                        'league_name' => $league['league_name'],
                        'event_name' => $event['strEvent'],
                        'event_time' => $event['strTimeLocal'],
                        'event_id' => $event['idEvent'],
                        'event_thumbnail' => $thumbnail, // Use thumbnail variable here
                        'tv_channels' => [],
                        'formatted_display_date' => $formattedDate
                    ];
            }
        }
    }

    // Save the fetched data to cache
    file_put_contents($cacheFile, json_encode($eventsByDate));

    return $eventsByDate ?: []; // Ensure it returns an array
}


// Fetch all selections to get league IDs
$db = new SQLite3('../databases/sports.db'); // Open the database

$result = $db->query("SELECT * FROM selections");
$leagues = [];

while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $leagues[] = [
        'league_id' => $row['league_id'],
        'league_name' => $row['league'],
    ];
}

// Fetch events with caching
$eventsByDate = fetchAndCacheEvents($leagues);

// Sort the events by date
if (!empty($eventsByDate)) {
    ksort($eventsByDate);
}

// Close the database connection
$db->close(); // Close the database connection
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upcoming Events</title>
    <link rel="stylesheet" href="../assets/css/sportsevents.css">
</head>

<body>
    <div class="container">
        <?php if (!empty($eventsByDate)): ?>
            <?php foreach ($eventsByDate as $sortableDate => $events): ?>
                <div class="event-date"><?php echo htmlspecialchars($events[0]['formatted_display_date']); ?></div> <!-- Centered date -->
                <div class="event-row-container"> <!-- Scrollable container for cards -->
                    <?php foreach ($events as $event): ?>
                        <div class="event-card" data-event-id="<?php echo htmlspecialchars($event['event_id']); ?>" tabindex="0">
                            <img src="<?php echo htmlspecialchars($event['event_thumbnail'] ?? '../assets/images/sports/default.jpg'); ?>" alt="<?php echo htmlspecialchars($event['event_name'] ?? 'Event Not Available'); ?>" class="event-thumbnail" />
                            <div class="overlay">
                                <div class="overlay-content">
                                    <h3><?php echo htmlspecialchars($event['league_name']); ?></h3>
                                    <p><?php echo htmlspecialchars($event['event_name']); ?></p>
                                    <p>Start: <?php echo htmlspecialchars(!empty($event['event_time']) ? $event['event_time'] : 'TBA'); ?></p>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p>No events found for the selected leagues.</p>
        <?php endif; ?>
    </div>


  <!-- Modal for TV Channels -->
<div id="tvModal" class="modal">
    <div class="modal-content" tabindex="0">
        <table id="tvChannelsTable" class="tv-channel-table">
            <thead>
                <tr>
                    <th>Channel Logo</th>
                    <th>Channel Name</th>
                    <th>Country</th> <!-- New column for Country -->
                </tr>
            </thead>
            <tbody id="tvChannelsList"></tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>

<script>
    let currentIndex = -1; // Track the currently focused card or row
    let inModal = false; // Flag to check if user is inside the modal

    const modal = document.getElementById("tvModal");
    const tvChannelsList = document.getElementById("tvChannelsList");
    const cards = document.querySelectorAll('.event-card'); // Get all event cards

    // Function to fetch and display TV channels in a table
    async function fetchTvChannels(eventId) {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/<?php echo $API_KEY; ?>/lookuptv.php?id=${eventId}`);
        const data = await response.json();

        tvChannelsList.innerHTML = ''; // Clear previous data

        // Check if there are any TV channels
        if (data.tvevent && data.tvevent.length > 0) {
            data.tvevent.forEach((channel, index) => {
                // Create a new row for each TV channel
                const row = document.createElement("tr");
                row.setAttribute("data-index", index); // Store the index in the row

                // Add the channel logo cell
                const logoCell = document.createElement("td");
                const logoImg = document.createElement("img");
                logoImg.src = channel.strLogo;
                logoImg.alt = channel.strChannel;
                logoCell.appendChild(logoImg);
                row.appendChild(logoCell);

                // Add the channel name cell
                const nameCell = document.createElement("td");
                nameCell.innerText = channel.strChannel;
                row.appendChild(nameCell);

                // Add the country cell (new column)
                const countryCell = document.createElement("td");
                countryCell.innerText = channel.strCountry || 'N/A'; // Display 'N/A' if country is not available
                row.appendChild(countryCell);

                // Append the row to the table
                tvChannelsList.appendChild(row);
            });
        } else {
            // No TV channels available, show a message
            tvChannelsList.innerHTML = "<tr><td colspan='3'>No TV channels available.</td></tr>";
        }

        modal.style.display = "block"; // Show the modal
        modal.querySelector('table').focus(); // Focus on the table to capture keyboard input

        inModal = true; // We're now inside the modal
    }

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"; // Hide the modal
            inModal = false; // We're back outside the modal
        }
    };

    // Function to handle key navigation inside the modal and event cards
    function handleKeyNavigation(event) {
        const rows = document.querySelectorAll("#tvChannelsList tr");

        if (inModal) {
            // Prevent event propagation when navigating inside the modal
            event.stopPropagation();

            // Navigate within modal rows
            if (event.key === 'ArrowDown') {
                // Move down
                if (currentIndex < rows.length - 1) {
                    currentIndex++;
                }

                // Ensure the row is visible and scroll the tbody if necessary
                if (rows[currentIndex]) {
                    const row = rows[currentIndex];
                    const rowRect = row.getBoundingClientRect();
                    const tbodyRect = tvChannelsList.getBoundingClientRect();

                    // Scroll the row into view if it's going out of the view
                    if (rowRect.bottom > tbodyRect.bottom) {
                        tvChannelsList.scrollTop += row.offsetHeight; // Scroll down
                    } else if (rowRect.top < tbodyRect.top) {
                        tvChannelsList.scrollTop -= row.offsetHeight; // Scroll up
                    }
                }
            } else if (event.key === 'ArrowUp') {
                // Move up
                if (currentIndex > 0) {
                    currentIndex--;
                }

                // Ensure the row is visible and scroll the tbody if necessary
                if (rows[currentIndex]) {
                    const row = rows[currentIndex];
                    const rowRect = row.getBoundingClientRect();
                    const tbodyRect = tvChannelsList.getBoundingClientRect();

                    // Scroll the row into view if it's going out of the view
                    if (rowRect.top < tbodyRect.top) {
                        tvChannelsList.scrollTop -= row.offsetHeight; // Scroll up
                    } else if (rowRect.bottom > tbodyRect.bottom) {
                        tvChannelsList.scrollTop += row.offsetHeight; // Scroll down
                    }
                }
            } else if (event.key === 'Enter' || event.key === ' ') {
                // Select the currently focused row
                const selectedRow = rows[currentIndex];
                if (selectedRow) {
                    selectedRow.classList.toggle('selected');
                    console.log(`Selected Channel: ${selectedRow.cells[1].innerText}`);
                }
            }

            // Remove the 'selected' class from all rows
            rows.forEach(row => row.classList.remove('selected'));

            // Add the 'selected' class to the current row
            if (rows[currentIndex]) {
                rows[currentIndex].classList.add('selected');
            }
        } else {
            // Navigate through event cards
            if (event.key === 'ArrowDown') {
                // Move down
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                }
            } else if (event.key === 'ArrowUp') {
                // Move up
                if (currentIndex > 0) {
                    currentIndex--;
                }
            } else if (event.key === 'Enter' || event.key === ' ') {
                // Click the currently focused card
                if (currentIndex >= 0) {
                    const eventId = cards[currentIndex].getAttribute('data-event-id');
                    fetchTvChannels(eventId); // Fetch TV channels when card is clicked
                }
            }

            // Remove focus from all cards
            cards.forEach(card => card.classList.remove('focused'));

            // Focus the new card
            if (cards[currentIndex]) {
                cards[currentIndex].focus(); // Set focus to the current index
                cards[currentIndex].classList.add('focused'); // Add a class for visual indication
            }
        }
    }

    // Attach event listeners for each card
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            fetchTvChannels(eventId); // Fetch TV channels when card is clicked
        });
    });

    // Add a keydown event listener to the window for arrow keys inside the modal and event cards
    window.addEventListener('keydown', handleKeyNavigation);

</script>

</body>

</html>