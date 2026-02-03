// This file can be used for global application-wide JavaScript or common utilities.
// Specific page-related logic is kept within script tags in their respective HTML files for this prototype.

// Example of a common utility (not strictly required by the prompt, but good practice)
function showLoadingSpinner() {
    // Implement a loading spinner display logic
    console.log('Showing loading spinner...');
    // e.g., document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoadingSpinner() {
    // Implement a loading spinner hide logic
    console.log('Hiding loading spinner...');
    // e.g., document.getElementById('loadingSpinner').style.display = 'none';
}

// You could also centralize API calls here if they become more complex or shared
// For now, simple fetch calls are embedded in the HTML script tags.
/*
async function fetchData(url, options = {}) {
    showLoadingSpinner();
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        alert('An error occurred: ' + error.message);
        throw error; // Re-throw to allow page-specific error handling
    } finally {
        hideLoadingSpinner();
    }
}
*/

// Basic login check for the demo (can be moved to a shared utility if needed)
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    const publicPages = ['/', '/index.html', '/login.html']; // Pages that don't require login

    if (!publicPages.includes(currentPage) && !localStorage.getItem('currentUser')) {
        // Uncomment the line below to enforce login for all non-public pages
        // window.location.href = '/login.html';
        console.warn('User not logged in (demo mode). Access granted for prototyping purposes.');
    }
});