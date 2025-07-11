function showProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.display = "block";
    progressBar.style.width = "0%"; // Reset width
    setTimeout(() => {
      progressBar.style.width = "100%"; // Animate to full width
    }, 50); // Slight delay to allow CSS transition
  }
}

function hideProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.width = "100%"; // Ensure it fills before hiding
    setTimeout(() => {
      progressBar.style.display = "none";
      progressBar.style.width = "0%"; // Reset for next use
    }, 300); // Delay to allow transition before hiding
  }
}
