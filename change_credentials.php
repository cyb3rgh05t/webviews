<div class="container mt-4">
    <div class="card bg-dark text-white shadow-sm">
        <div class="card-header">
            <h5 class="mb-0">Change Credentials</h5>
        </div>
        <div class="card-body">
            <div id="notification" class="alert" style="display: none;"></div>
            <form id="changeCredentialsForm" method="POST">
                <div class="form-group">
                    <label for="username">New Username</label>
                    <input type="text" class="form-control bg-dark text-white" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">New Password</label>
                    <input type="password" class="form-control bg-dark text-white" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-warning mt-3">Update Credentials</button>
                <div id="responseMessage" class="mt-3"></div>
            </form>
        </div>
    </div>
</div>

<script>
    // Handle form submission using AJAX with JSON response
    $('#changeCredentialsForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission
        showProgressBar(); // Show progress bar at the start

        $.ajax({
            url: 'includes/update_credentials.php',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json', // Expect JSON response
            success: function(response) {
                console.log("AJAX response received:", response);
                // Display notification based on response type
                if (response.type && response.message) {
                    showNotification(response.type, response.message);
                } else {
                    showNotification('danger', 'An unexpected error occurred.');
                }
            },
            error: function() {
                console.error("AJAX error while updating credentials.");
                showNotification('danger', 'An error occurred while updating credentials.');
            },
            complete: function() {
                hideProgressBar(); // Hide progress bar after submission
            }
        });
    });
</script>