<!-- JavaScript for AJAX form submission and live preview -->
// AJAX Form submission - exactly like backdrop.php
document.getElementById('marqueeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    showProgressBar(); // Show progress bar at start of form submission
    console.log('Marquee form submission triggered.');

    const formData = new FormData(this);
    console.log('Form data collected:', Object.fromEntries(formData.entries()));

    fetch('marquee.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => {
        console.log('Server response received.');
        return response.json();
    })
    .then(data => {
        console.log('Parsed JSON response:', data);

        // Display notification with appropriate type based on success
        showNotification(data.success ? 'success' : 'error', data.message);

        if (data.success) {
            console.log('Marquee settings saved successfully, reloading page...');
            // Reload page after brief delay to show success message
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    })
    .catch(error => {
        console.error('Error saving marquee settings:', error);
        showNotification('error', 'An error occurred while saving the marquee settings.');
    })
    .finally(() => {
        hideProgressBar(); // Hide progress bar when form submission completes
    });
});

// Live Preview Update Function
function updateLivePreview() {
    const headerText = document.getElementById('header_t').value || 'Header Preview';
    const headerTextColor = document.getElementById('header_t_c').value;
    const headerBgColor = document.getElementById('header_b_c').value;
    const marqueeText = document.getElementById('marquee_t').value || 'Marquee text will appear here...';
    const marqueeTextColor = document.getElementById('marquee_t_c').value;
    const marqueeBgColor = document.getElementById('marquee_b_c').value;

    console.log('Updating live preview with:', { headerText, headerTextColor, headerBgColor, marqueeText, marqueeTextColor, marqueeBgColor });

    // Update main preview
    const previewHeader = document.getElementById('preview-header');
    const previewWrapper = document.getElementById('preview-wrapper');
    const previewMarquee = document.getElementById('preview-marquee');

    if (previewHeader && previewWrapper && previewMarquee) {
        // Update header
        previewHeader.textContent = headerText;
        previewHeader.style.color = headerTextColor;
        previewHeader.style.backgroundColor = headerBgColor;

        // Update marquee
        previewMarquee.textContent = marqueeText;
        previewWrapper.style.color = marqueeTextColor;
        previewWrapper.style.backgroundColor = marqueeBgColor;

        // Restart marquee animation
        try {
            previewMarquee.stop();
            setTimeout(() => previewMarquee.start(), 10);
        } catch (e) {
            console.log('Marquee restart not supported in this browser');
        }
    }

    // Update JSON preview
    updateJsonPreview(headerText, marqueeText, headerTextColor);
}

// Update JSON preview
function updateJsonPreview(headerText, marqueeText, headerTextColor) {
    const jsonHeaderText = document.getElementById('json-header-text');
    const jsonMarqueeText = document.getElementById('json-marquee-text');
    const jsonHeaderColor = document.getElementById('json-header-color');
    
    if (jsonHeaderText) jsonHeaderText.textContent = headerText;
    if (jsonMarqueeText) jsonMarqueeText.textContent = marqueeText;
    if (jsonHeaderColor) jsonHeaderColor.textContent = headerTextColor;
}

// Add event listeners for live preview
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up live preview...');
    
    const inputs = document.querySelectorAll('#header_t, #header_t_c, #header_b_c, #marquee_t, #marquee_t_c, #marquee_b_c');
    console.log('Found inputs:', inputs.length);
    
    // Debounce function for better performance
    let debounceTimer;
    function debouncedUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateLivePreview, 100);
    }
    
    inputs.forEach((input, index) => {
        console.log(`Setting up listener for input ${index}:`, input.id);
        
        // Multiple event types for better compatibility
        input.addEventListener('input', debouncedUpdate);
        input.addEventListener('change', updateLivePreview);
        input.addEventListener('keyup', debouncedUpdate);
        input.addEventListener('paste', () => setTimeout(updateLivePreview, 10));
    });
    
    // Initial update
    setTimeout(updateLivePreview, 100);
    console.log('Live preview setup complete');
});

// Reset form function
function resetForm() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        document.getElementById('header_t').value = '';
        document.getElementById('header_t_c').value = '#ffffff';
        document.getElementById('header_b_c').value = '#000000';
        document.getElementById('marquee_t').value = '';
        document.getElementById('marquee_t_c').value = '#000000';
        document.getElementById('marquee_b_c').value = '#ffffff';
        
        // Force update preview after reset
        setTimeout(updateLivePreview, 100);
        
        // Show success notification if function exists
        if (typeof showNotification === 'function') {
            showNotification('success', 'Form reset to default values');
        }
    }
}

// Copy to clipboard function
function copyToClipboard(inputId) {
    const inputField = document.getElementById(inputId);
    inputField.select();
    document.execCommand('copy');

    // Create custom on-screen popup (toast-style)
    const toast = document.createElement('div');
    toast.textContent = 'Copied to clipboard!';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);

    // Show and hide the toast after 2 seconds
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Remove focus from buttons after click
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        button.blur();
    });
});