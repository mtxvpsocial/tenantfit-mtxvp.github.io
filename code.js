const baseUrl = "https://tenantfit-api.mtxvp.com/";

// Store logged-in user info in localStorage for persistence across refreshes
let currentUser = null;

function saveCurrentUser(user) {
    currentUser = user;
    if (user && user.userId) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function loadCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.userId) {
            currentUser = user;
        } else {
            currentUser = null;
        }
    } catch (e) {
        currentUser = null;
    }
}

// Call this at the top of your script or before any screen logic
loadCurrentUser();

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.textContent = message;
    alertContainer.className = `alert alert-${type}`;
    alertContainer.classList.remove('hidden');

    setTimeout(() => {
        alertContainer.classList.add('hidden');
    }, 3000); // Disappear after 3 seconds
}

function showOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}

function fetchWithOverlay(url, options) {
    showOverlay();
    return fetch(url, options).finally(hideOverlay);
}

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheck = document.getElementById('termsCheck').checked;

    // Client-side validation
    if (!email || !password || !confirmPassword || !termsCheck || password !== confirmPassword) {
        document.getElementById('registerForm').classList.add('was-validated');
        return;
    }

    // Simulate captcha validation (replace with actual captcha logic)
    const captchaValid = true;
    if (!captchaValid) {
        showAlert('Captcha validation failed.', 'danger');
        return;
    }

    // Send data to the server
    showOverlay();
    fetch(baseUrl + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('A confirmation email has been sent to your email address. Please check your inbox.');
            showConfirmEmailScreen();
        } else {
            showAlert(data.message || 'Registration failed.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function handleConfirmEmail() {
    const email = document.getElementById('confirmEmailInput').value;
    const confirmationCode = document.getElementById('confirmationCode').value;

    // Client-side validation
    if (!email || !confirmationCode) {
        document.getElementById('confirmEmailForm').classList.add('was-validated');
        return;
    }

    // Send data to the server
    showOverlay();
    fetch(baseUrl + '/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode: confirmationCode.toLowerCase() })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Email confirmed!');
            showLoginScreen();
        } else {
            showAlert(data.message || 'Confirmation failed.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Client-side validation
    if (!email || !password) {
        document.getElementById('loginForm').classList.add('was-validated');
        return;
    }

    // Send data to the server
    showOverlay();
    fetch(baseUrl + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store user info (email and userId)
            saveCurrentUser({ email, userId: data.userId });
            showAlert('Login successful!');
            showDashboardScreen();
        } else {
            showAlert(data.message || 'Login failed.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function sendResetCode() {
    const email = document.getElementById('forgotEmail').value;

    // Client-side validation
    if (!email) {
        document.getElementById('forgotPasswordForm').classList.add('was-validated');
        return;
    }

    // Send data to the server
    showOverlay();
    fetch(baseUrl + '/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Reset code sent to your email.');
            showResetPasswordScreen();
        } else {
            showAlert(data.message || 'Failed to send reset code.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function resetPassword() {
    const email = document.getElementById('resetEmail').value;
    const resetCode = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Client-side validation
    if (!email || !resetCode || !newPassword || !confirmNewPassword) {
        document.getElementById('resetPasswordForm').classList.add('was-validated');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showAlert('Passwords do not match. Please try again.', 'danger');
        return;
    }

    // Send data to the server
    showOverlay();
    fetch(baseUrl + '/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Password reset successful!');
            showLoginScreen();
        } else {
            showAlert(data.message || 'Failed to reset password.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function showLandingScreen() {
    hideAllScreens();
    document.getElementById('landingScreen').classList.remove('hidden');
    if (history.state?.screen !== '') {
        history.pushState({ screen: 'landing' }, '', '/');
    }
}


function showLoginScreen() {
    hideAllScreens();
    document.getElementById('loginScreen').classList.remove('hidden');
    if (history.state?.screen !== 'login') {
        history.pushState({ screen: 'login' }, '', '#login');
    }
}

function showRegisterScreen() {
    hideAllScreens();
    document.getElementById('registerScreen').classList.remove('hidden');
    if (history.state?.screen !== 'register') {
        history.pushState({ screen: 'register' }, '', '#register');
    }
}

function showForgotPasswordScreen() {
    hideAllScreens();
    document.getElementById('forgotPasswordScreen').classList.remove('hidden');
    if (history.state?.screen !== 'forgotPassword') {
        history.pushState({ screen: 'forgotPassword' }, '', '#forgotPassword');
    }
}

function showConfirmEmailScreen() {
    hideAllScreens();
    document.getElementById('confirmEmailScreen').classList.remove('hidden');
    if (history.state?.screen !== 'confirmEmail') {
        history.pushState({ screen: 'confirmEmail' }, '', '#confirmEmail');
    }
}

function showResetPasswordScreen() {
    hideAllScreens();
    document.getElementById('resetPasswordScreen').classList.remove('hidden');
    if (history.state?.screen !== 'resetPassword') {
        history.pushState({ screen: 'resetPassword' }, '', '#resetPassword');
    }
}

function showDashboardScreen() {
    hideAllScreens();
    document.getElementById('dashboardScreen').classList.remove('hidden');
    // Update browser history and hash for back/reload support
    if (history.state?.screen !== 'dashboard') {
        history.pushState({ screen: 'dashboard' }, '', '#dashboard');
    }
    fetchProperties();
}

function showAddPropertyScreen(editId = null) {
    hideAllScreens();
    document.getElementById('addPropertyScreen').classList.remove('hidden');
    document.getElementById('addPropertyForm').reset();
    document.getElementById('addPropertyForm').classList.remove('was-validated');
    document.getElementById('savePropertyButton').innerHTML = editId ? 'Update' : 'Add';
    document.getElementById('property_id').value = editId || '';
    if (editId) {
        showOverlay();
        fetch(baseUrl + `/get-property?id=${encodeURIComponent(editId)}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const prop = data;
                    document.getElementById('property_address').value = prop.address || '';
                    document.getElementById('property_description').value = prop.description || '';
                    document.getElementById('property_link').value = prop.link || '';
                    document.getElementById('property_availability').value = prop.availability ? prop.availability.slice(0, 10) : '';
                    document.getElementById('property_rent').value = prop.rent || '';
                } else {
                    showAlert(data.message || 'Failed to load property details.', 'danger');
                }
            })
            .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
            .finally(hideOverlay);
    }
    // Update browser history and hash for back/reload support
    const expectedScreen = editId ? 'editProperty' : 'addProperty';
    const expectedHash = editId ? `#editProperty/${encodeURIComponent(editId)}` : '#addProperty';
    if (history.state?.screen !== expectedScreen || (editId && history.state?.propertyId !== editId)) {
        history.pushState(
            editId ? { screen: 'editProperty', propertyId: editId } : { screen: 'addProperty' },
            '',
            expectedHash
        );
    }
}

function editProperty(id) {
    showAddPropertyScreen(id);
}

function saveProperty() {
    const id = document.getElementById('property_id').value;
    const address = document.getElementById('property_address').value;
    const description = document.getElementById('property_description').value;
    const link = document.getElementById('property_link').value;
    const availability = document.getElementById('property_availability').value;
    const rent = document.getElementById('property_rent').value;

    // Validate required fields
    if (!address || !description || !availability || !rent) {
        document.getElementById('addPropertyForm').classList.add('was-validated');
        return;
    }

    // Validate availability date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (availability < today) {
        showAlert('Availability date cannot be in the past.', 'danger');
        return;
    }

    // Validate link if provided
    if (link && !isValidURL(link)) {
        showAlert('Please provide a valid URL for the link.', 'danger');
        return;
    }

    showOverlay();
    fetch(baseUrl + (id ? '/edit-property' : '/add-property'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id,
            ownerId: currentUser && currentUser.userId,
            address,
            description,
            link,
            availability,
            rent
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.prompt) {
                showAlert(data.prompt, 'warning');
            } else {
                showAlert(id ? 'Property updated!' : 'Property added!');
            }
            showDashboardScreen();
        } else {
            showAlert(data.message || 'Failed to save property.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function updatePropertyStatus(action, id, ownerId, successMessage, errorMessage) {
    showOverlay();
    fetch(baseUrl + `/${action}-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ownerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(successMessage);
            fetchProperties();
        } else {
            showAlert(data.message || errorMessage, 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

// function deleteProperty(id) {
//     if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
//     updatePropertyStatus('delete', id, currentUser && currentUser.userId, 'Property deleted!', 'Could not delete property.');
// }

function activateProperty(id) {
    updatePropertyStatus('activate', id, currentUser && currentUser.userId, 'Property activated!', 'Could not activate property.');
}

function deactivateProperty(id) {
    updatePropertyStatus('deactivate', id, currentUser && currentUser.userId, 'Property deactivated!', 'Could not deactivate property.');
}

function fetchProperties() {
    showOverlay();
    const params = new URLSearchParams({
        ownerId: currentUser && currentUser.userId
    });
    fetch(baseUrl + '/list-properties?' + params.toString(), {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        renderProperties(data.properties || []);
        updateUsageMeter(data.activeCount || 0, data.maxActive || 1);
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

function updateUsageMeter(activeCount, maxActive) {
    const usageMeter = document.getElementById('usageMeter');
    if (usageMeter) {
        usageMeter.textContent = `${activeCount} of ${maxActive} active listings used`;
        usageMeter.className = `badge ${activeCount >= maxActive ? 'bg-danger' : 'bg-info'} text-dark align-self-start align-self-sm-center mt-2 mt-sm-0`;
    }
}

function renderProperties(properties) {
    const tbody = document.getElementById('propertiesTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        properties.forEach(prop => {
            const isActive = prop.status === 'Active';
            const publicUrl = `${window.location.origin + window.location.pathname}#publicProperty?id=${prop.id}`;
            const activateBtn = isActive
                ? `<button class="btn btn-sm btn-outline-secondary" title="Deactivate" onclick="deactivateProperty('${prop.id}')">
                        <i class="bi bi-toggle2-on"></i>
                        <span class="visually-hidden">Deactivate</span>
                   </button>`
                : `<button class="btn btn-sm btn-outline-success" title="Activate" onclick="activateProperty('${prop.id}')">
                        <i class="bi bi-toggle2-off"></i>
                        <span class="visually-hidden">Activate</span>
                   </button>`;
            const copyBtn = `<button class="btn btn-sm btn-outline-primary me-1 ${isActive ? 'active bg-success' : ''}" title="Copy Link" onclick="copyLink('${publicUrl}')" ${!isActive ? 'disabled' : ''}>
                            <i class="bi bi-clipboard"></i>
                            <span class="visually-hidden">Copy Link</span>
                         </button>`;
            const candidatesLink = `<a href="javascript:void(0)" onclick="showTenantCandidatesScreen('${prop.id}')">${prop.candidatesCount || 0}</a>`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-break">
                    <i class="bi bi-pencil-square text-primary me-2" role="button" title="Edit" onclick="editProperty('${prop.id}')"></i>
                    <a href="javascript:void(0)" onclick="editProperty('${prop.id}')">${prop.address}</a>
                </td>
                <td>
                    <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">${prop.status}</span>
                </td>
                <td>${candidatesLink}</td>
                <td class="text-end d-none d-sm-table-cell">
                    <div class="d-flex dashboard-actions justify-content-end">
                        ${activateBtn}
                        ${copyBtn}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function backToTenantCandidatesScreen(){
    const propertyId = document.getElementById('candidateDetailsScreen').getAttribute('data-property-id');
    showTenantCandidatesScreen(propertyId);
}

function showTenantCandidatesScreen(propertyId) {
    hideAllScreens();
    document.getElementById('tenantCandidatesScreen').classList.remove('hidden');
    const container = document.getElementById('tenantCandidatesContent');
    container.innerHTML = ''; // Clear previous content
    showOverlay();
    fetch(`${baseUrl}/get-tenant-candidates?propertyId=${encodeURIComponent(propertyId)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                container.innerHTML = `<div class="alert alert-danger">${data.message || 'Failed to load tenant candidates.'}</div>`;
            } else if (data.candidates.length === 0) {
                container.innerHTML = `<div class="alert alert-warning">No tenant candidates found for this property.</div>`;
            } else {
                const table = document.createElement('table');
                table.classList.add('table', 'table-hover', 'align-middle', 'w-100');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Move-In</th>
                            <th>Occupants</th>
                            <th class="d-none d-md-table-cell">Employment</th>
                            <th class="d-none d-lg-table-cell">Profession</th>
                            <th class="d-none d-lg-table-cell">Income</th>
                            <th class="d-none d-md-table-cell">Vehicles</th>
                            <th>Score</th>
                            <th class="d-none d-md-table-cell">Date</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                const tbody = table.querySelector('tbody');
                const rowTemplate = document.getElementById('tenantCandidateRowTemplate');
                data.candidates.forEach(candidate => {
                    const row = rowTemplate.content.cloneNode(true);
                    const tds = row.querySelectorAll('td');
                    tds[0].textContent = candidate.moveInDate || '';
                    tds[1].textContent = candidate.occupants || '';
                    tds[2].textContent = candidate.employmentStatus || '';
                    tds[3].textContent = candidate.profession || '';
                    tds[4].textContent = candidate.grossIncome || '';
                    tds[5].textContent = candidate.vehicles || '';
                    tds[6].textContent = candidate.score !== undefined && candidate.score !== null ? candidate.score : '';
                    tds[7].textContent = candidate.applicationDate || '';
                    // Details link
                    const detailsLink = tds[8].querySelector('a');
                    detailsLink.onclick = () => showCandidateDetailsScreen(candidate.id);
                    tbody.appendChild(row);
                });
                container.appendChild(table);
            }
        })
        .catch(() => {
            container.innerHTML = `<div class="alert alert-danger">Error loading tenant candidates.</div>`;
        })
        .finally(hideOverlay);

    // Update browser history and hash for back/reload support
    if (history.state?.screen !== 'tenantCandidates' || history.state?.propertyId !== propertyId) {
        history.pushState({ screen: 'tenantCandidates', propertyId }, '', `#tenantCandidates/${encodeURIComponent(propertyId)}`);
    }
}

function showCandidateDetailsScreen(candidateId) {
    hideAllScreens();
    document.getElementById('candidateDetailsScreen').classList.remove('hidden');

    showOverlay();
    fetch(`${baseUrl}/get-tenant-candidate-details?id=${encodeURIComponent(candidateId)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                showAlert(data.message || 'Failed to load candidate details.', 'danger');
                return;
            }

            const candidate = data.candidate;
            const content = document.getElementById('candidateDetailsContent');
            const template = document.getElementById('candidateDetailsTemplate');
            content.innerHTML = '';
            if (template) {
                const node = template.content.cloneNode(true);

                // Score badge
                const badge = node.querySelector('#candidateScoreBadge');
                if (badge) {
                    badge.className = `badge ${getScoreBadgeClass(candidate.score)}`;
                    badge.querySelector('.score-value').textContent = candidate.score || 'N/A';
                }

                // Helper for boolean display
                function boolDisplay(val) {
                    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
                    if (val === true || val === 'true' || val === 'Yes') return 'Yes';
                    if (val === false || val === 'false' || val === 'No') return 'No';
                    return val || 'N/A';
                }

                // Fill all data-fields
                node.querySelectorAll('[data-field]').forEach(el => {
                    const field = el.getAttribute('data-field');
                    let val = candidate[field];

                    // Special handling for booleans and checkboxes
                    if (['declaration1', 'declaration2', 'consentContact', 'consentNews'].includes(field)) {
                        el.textContent = boolDisplay(val);
                    } else if (field === 'pets' && !val) {
                        el.textContent = 'No';
                    } else if (field === 'moveInDate' && !val && candidate.moveindate) {
                        el.textContent = candidate.moveindate;
                    } else if (field === 'applicationDate' && !val && candidate.applicationdate) {
                        el.textContent = candidate.applicationdate;
                    } else {
                        el.textContent = val || 'N/A';
                    }
                });

                // Show/hide details based on candidate data
                if (candidate.petDetails) {
                    const petDetailsItem = node.querySelector('.pet-details-item');
                    if (petDetailsItem) petDetailsItem.style.display = '';
                }
                if (candidate.specialVehiclesDetails) {
                    const specialVehiclesDetailsItem = node.querySelector('.special-vehicles-details-item');
                    if (specialVehiclesDetailsItem) specialVehiclesDetailsItem.style.display = '';
                }
                if (candidate.privateLandlord === 'Yes') {
                    const rentalUnitsItem = node.querySelector('.rental-units-item');
                    if (rentalUnitsItem) rentalUnitsItem.style.display = '';
                }
                if (candidate.rentDifficulty) {
                    const rentDifficultyItem = node.querySelector('.rent-difficulty-item');
                    if (rentDifficultyItem) rentDifficultyItem.style.display = '';
                }
                if (candidate.rentDifficultyDetails) {
                    const rentDifficultyDetailsItem = node.querySelector('.rent-difficulty-details-item');
                    if (rentDifficultyDetailsItem) rentDifficultyDetailsItem.style.display = '';
                }
                if (candidate.tenancyNotice) {
                    const tenancyNoticeItem = node.querySelector('.tenancy-notice-item');
                    if (tenancyNoticeItem) tenancyNoticeItem.style.display = '';
                }
                if (candidate.tenancyNoticeDetails) {
                    const tenancyNoticeDetailsItem = node.querySelector('.tenancy-notice-details-item');
                    if (tenancyNoticeDetailsItem) tenancyNoticeDetailsItem.style.display = '';
                }
                if (candidate.rentalDispute) {
                    const rentalDisputeItem = node.querySelector('.rental-dispute-item');
                    if (rentalDisputeItem) rentalDisputeItem.style.display = '';
                }
                if (candidate.rentalDisputeDetails) {
                    const rentalDisputeDetailsItem = node.querySelector('.rental-dispute-details-item');
                    if (rentalDisputeDetailsItem) rentalDisputeDetailsItem.style.display = '';
                }
                if (candidate.profession) {
                    const professionItem = node.querySelector('.profession-item');
                    if (professionItem) professionItem.style.display = '';
                }
                if (candidate.employmentDuration) {
                    const employmentDurationItem = node.querySelector('.employment-duration-item');
                    if (employmentDurationItem) employmentDurationItem.style.display = '';
                }
                if (candidate.businessActivityDetails) {
                    const businessActivityDetailsItem = node.querySelector('.business-activity-details-item');
                    if (businessActivityDetailsItem) businessActivityDetailsItem.style.display = '';
                }

                content.appendChild(node);
            }

            // Store propertyId for back navigation (prefer candidate.propertyId if available)
            document.getElementById('candidateDetailsScreen').setAttribute('data-property-id', candidate.propertyid);
        })
        .catch(error => {
            showAlert('Error loading candidate details: ' + error.message, 'danger');
        })
        .finally(hideOverlay);

    // Update browser history and hash for back/reload support
    if (history.state?.screen !== 'candidateDetails' || history.state?.candidateId !== candidateId) {
        history.pushState({ screen: 'candidateDetails', candidateId }, '', `#candidateDetails/${encodeURIComponent(candidateId)}`);
    }
}

function getScoreBadgeClass(score) {
    if (!score) return 'bg-secondary';
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-info';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
}

function getPropertyId(){
    const hash = window.location.hash;
    // REST-style: #publicProperty/abc
    if (hash.startsWith('#publicProperty/')) {
        return hash.split('/')[1];
    }
    // fallback for old style (should not be needed after migration)
    const params = new URLSearchParams(hash.split('?')[1]);
    return params.get('id');
}

// --- Public Property View ---
function showPublicPropertyScreen() {
    const propertyId = getPropertyId();
    if (!propertyId) {
        return false;
    }
    
    hideAllScreens();
    const screen = document.getElementById('publicPropertyScreen');
    if (screen) {
        screen.classList.remove('hidden');
    }
    const container = document.getElementById('publicPropertyContent');
    if (container) {
        container.innerHTML = ''; // Clear previous content
    }
    showOverlay();
    fetch(baseUrl + '/get-property?id=' + encodeURIComponent(propertyId), { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                container.innerHTML = `<div class="alert alert-danger">${data.message || 'Property not found.'}</div>`;
            } else {
                container.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title">${data.address}</h4>
                            <p class="card-text">${data.description}</p>
                            ${data.link ? `<p class="card-text"><a href="${data.link}" target="_blank">View Listing</a></p>` : ''}
                            <p class="card-text"><small class="text-muted">Available: ${data.availability ? data.availability.slice(0, 10) : 'N/A'}</small></p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(() => {
            container.innerHTML = `<div class="alert alert-danger">Error loading property.</div>`;
        })
        .finally(hideOverlay);

    return true;
}

function logout() {
    saveCurrentUser(null);
    showLoginScreen();
    showAlert('Logged out successfully.', 'info');
}

function hideAllScreens() {
    // Ensure all screens are hidden
    const screens = [
        'landingScreen', 'loginScreen', 'registerScreen', 'forgotPasswordScreen', 
        'confirmEmailScreen', 'resetPasswordScreen', 'dashboardScreen', 
        'addPropertyScreen', 'publicPropertyScreen', 'tenantCandidatesScreen',
        'confirmationScreen', 'thankYouScreen', 'tenantDetailsScreen', 'candidateDetailsScreen'
    ];
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('hidden');
        }
    });
}

// Handle browser back button
window.onpopstate = function (event) {
    if (event.state) {
        handleScreen(event.state.screen);
    } else {
        handleHashOrDefault();
    }
};

function handleScreen(screen) {
    switch (screen) {
        case 'login':
            showLoginScreen();
            break;
        case 'register':
            showRegisterScreen();
            break;
        case 'forgotPassword':
            showForgotPasswordScreen();
            break;
        case 'confirmEmail':
            showConfirmEmailScreen();
            break;
        case 'resetPassword':
            showResetPasswordScreen();
            break;
        case 'dashboard':
            showDashboardScreen();
            break;
        case 'addProperty':
            showAddPropertyScreen();
            break;
        case 'editProperty': {
            // Try to get propertyId from state or hash
            let propertyId = history.state?.propertyId;
            if (!propertyId) {
                const hash = window.location.hash;
                // REST-style: #editProperty/abc
                if (hash.startsWith('#editProperty/')) {
                    propertyId = hash.split('/')[1];
                }
            }
            showAddPropertyScreen(propertyId);
            break;
        }
        case 'candidateDetails': {
            // Try to get candidateId from state or hash
            let candidateId = history.state?.candidateId;
            if (!candidateId) {
                const hash = window.location.hash;
                // REST-style: #candidateDetails/abc
                if (hash.startsWith('#candidateDetails/')) {
                    candidateId = hash.split('/')[1];
                }
            }
            if (candidateId) showCandidateDetailsScreen(candidateId);
            else showDashboardScreen();
            break;
        }
        case 'tenantCandidates': {
            let propertyId = history.state?.propertyId;
            if (!propertyId) {
                const hash = window.location.hash;
                // REST-style: #tenantCandidates/abc
                if (hash.startsWith('#tenantCandidates/')) {
                    propertyId = hash.split('/')[1];
                }
            }
            if (propertyId) showTenantCandidatesScreen(propertyId);
            else showDashboardScreen();
            break;
        }
        default:
            showLoginScreen();
    }
}

function handleHashOrDefault() {
    const hash = window.location.hash;
    if (hash.startsWith('#resetPassword')) {
        // legacy: #resetPassword?email=...&code=...
        const params = new URLSearchParams(hash.split('?')[1]);
        const resetPasswordEmail = params.get('email');
        const resetPasswordCode = params.get('code');

        if (resetPasswordEmail && resetPasswordCode) {
            document.getElementById('resetEmail').value = resetPasswordEmail;
            document.getElementById('resetCode').value = resetPasswordCode;
            showResetPasswordScreen();
            return;
        }
    } else if (hash.startsWith('#confirmEmail')) {
        // legacy: #confirmEmail?email=...&code=...
        const params = new URLSearchParams(hash.split('?')[1]);
        const confirmEmail = params.get('email');
        const confirmCode = params.get('code');

        if (confirmEmail && confirmCode) {
            document.getElementById('confirmEmailInput').value = confirmEmail;
            document.getElementById('confirmationCode').value = confirmCode;
            showConfirmEmailScreen();
            return;
        }
    } else if (hash.startsWith('#login')) {
        showLoginScreen();
        return;
    } else if (hash.startsWith('#register')) {
        showRegisterScreen();
        return;
    } else if (hash.startsWith('#forgotPassword')) {
        showForgotPasswordScreen();
        return;
    } else if (hash.startsWith('#publicProperty')) {
        if(showPublicPropertyScreen())
            return;
    } else if (hash.startsWith('#tenantCandidates/')) {
        const propertyId = hash.split('/')[1];
        if (propertyId) {
            showTenantCandidatesScreen(propertyId);
            return;
        }
    } else if (hash.startsWith('#candidateDetails/')) {
        const candidateId = hash.split('/')[1];
        if (candidateId) {
            showCandidateDetailsScreen(candidateId);
            return;
        }
    } else if (hash.startsWith('#dashboard')) {
        showDashboardScreen();
        return;
    } else if (hash.startsWith('#addProperty')) {
        showAddPropertyScreen();
        return;
    } else if (hash.startsWith('#editProperty/')) {
        const propertyId = hash.split('/')[1];
        showAddPropertyScreen(propertyId);
        return;
    }

    showLandingScreen();
}

// On page load, handle hash or initialize default screen
(function() {
    handleHashOrDefault();
})();

document.getElementById('loginForm').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        login(); // Trigger login function
    }
});

function copyLink(link) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link)
            .then(() => {
                showAlert('Link copied to clipboard!', 'success');
            })
            .catch(() => {
                showAlert('Failed to copy link.', 'danger');
            });
    } else {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            showAlert('Link copied to clipboard!', 'success');
        } catch (error) {
            showAlert('Failed to copy link.', 'danger');
        }
        document.body.removeChild(tempInput);
    }
}

// Validate move-in date to ensure it is not in the past
document.getElementById('moveInDate').addEventListener('change', function () {
    const moveInDate = new Date(this.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    if (moveInDate < today) {
        this.setCustomValidity('Move-in date cannot be in the past.');
    } else {
        this.setCustomValidity('');
    }
});

// Centralized function to handle visibility logic
function updateVisibility() {
    const pets = document.getElementById('pets');
    const petDetailsContainer = document.getElementById('petDetailsContainer');
    petDetailsContainer.style.display = (pets.value && pets.value !== 'No') ? 'block' : 'none';

    const privateLandlord = document.getElementById('privateLandlord');
    const rentalHistoryDetails = document.getElementById('rentalHistoryDetails');
    rentalHistoryDetails.style.display = privateLandlord.value === 'Yes' ? 'block' : 'none';

    const rentDifficulty = document.getElementById('rentDifficulty');
    const rentDifficultyDetailsContainer = document.getElementById('rentDifficultyDetailsContainer');
    rentDifficultyDetailsContainer.style.display = rentDifficulty.value === 'Yes' ? 'block' : 'none';

    const tenancyNotice = document.getElementById('tenancyNotice');
    const tenancyNoticeDetailsContainer = document.getElementById('tenancyNoticeDetailsContainer');
    tenancyNoticeDetailsContainer.style.display = tenancyNotice.value === 'Yes' ? 'block' : 'none';

    const rentalDispute = document.getElementById('rentalDispute');
    const rentalDisputeDetailsContainer = document.getElementById('rentalDisputeDetailsContainer');
    rentalDisputeDetailsContainer.style.display = rentalDispute.value === 'Yes' ? 'block' : 'none';

    const employmentStatus = document.getElementById('employmentStatus');
    const employmentDetails = document.getElementById('employmentDetails');
    employmentDetails.style.display = (employmentStatus.value && employmentStatus.value !== 'Unemployed' && employmentStatus.value !== 'Retired') ? 'block' : 'none';

    const businessActivity = document.getElementById('businessActivity');
    const businessActivityDetailsContainer = document.getElementById('businessActivityDetailsContainer');
    businessActivityDetailsContainer.style.display = businessActivity.value === 'Yes' ? 'block' : 'none';

    const specialVehicles = document.getElementById('specialVehicles');
    const specialVehiclesDetailsContainer = document.getElementById('specialVehiclesDetailsContainer');
    specialVehiclesDetailsContainer.style.display = specialVehicles.value === 'Yes — Other' ? 'block' : 'none';
}

// Attach event listeners for interaction
function attachVisibilityListeners() {
    document.getElementById('pets').addEventListener('change', updateVisibility);
    document.getElementById('privateLandlord').addEventListener('change', updateVisibility);
    document.getElementById('rentDifficulty').addEventListener('change', updateVisibility);
    document.getElementById('tenancyNotice').addEventListener('change', updateVisibility);
    document.getElementById('rentalDispute').addEventListener('change', updateVisibility);
    document.getElementById('employmentStatus').addEventListener('change', updateVisibility);
    document.getElementById('businessActivity').addEventListener('change', updateVisibility);
    document.getElementById('specialVehicles').addEventListener('change', updateVisibility);
}

// Initialize visibility logic on page load
document.addEventListener('DOMContentLoaded', () => {
    updateVisibility(); // Ensure visibility is correct on load
    attachVisibilityListeners(); // Attach listeners for interaction
});

function showThankYouScreen(message) {
    hideAllScreens();
    const thankYouScreen = document.getElementById('thankYouScreen');
    const thankYouMessage = document.getElementById('thankYouMessage');
    thankYouMessage.textContent = message;
    thankYouScreen.classList.remove('hidden');
}

function submitApplication() {
    const form = document.getElementById('applyForm');
    const errorsContainer = document.getElementById('applyFormErrors');
    errorsContainer.innerHTML = ''; // Clear previous errors
    errorsContainer.classList.add('hidden');

    const notHiddenFields = form.querySelectorAll(':not(.hidden) [required], :not(.hidden) [optional]');
    let isValid = true;
    const errorMessages = [];

    function isVisibleWithParent(field){
        return !!(field.offsetParent) 
    }

    notHiddenFields.forEach(field => {
        if (isVisibleWithParent(field) && !field.checkValidity()) {
            isValid = false;
            const label = form.querySelector(`label[for="${field.id}"]`);
            errorMessages.push(label ? `${label.textContent.trim()}: ${field.validationMessage}` : field.validationMessage);
        }
    });


    if (!isValid) {
        errorsContainer.innerHTML = errorMessages.join('<br>');
        errorsContainer.classList.remove('hidden');
        return;
    }

    const data = {
        propertyId: getPropertyId(),
        email: document.getElementById('applicantEmail').value,
        consentContact: document.getElementById('consentContact').checked,
        consentNews: document.getElementById('consentNews').checked,
        moveInDate: document.getElementById('moveInDate').value,
        occupants: document.getElementById('occupants').value,
        smokers: document.getElementById('smokers').value,
        pets: document.getElementById('pets').value,
        petDetails: document.getElementById('petDetails').value || null,
        housingSituation: document.getElementById('housingSituation').value,
        residenceDuration: document.getElementById('residenceDuration').value,
        reasonForMoving: document.getElementById('reasonForMoving').value || null,
        privateLandlord: document.getElementById('privateLandlord').value,
        rentalUnits: document.getElementById('rentalUnits').value || null,
        rentDifficulty: document.getElementById('rentDifficulty').value || null,
        rentDifficultyDetails: document.getElementById('rentDifficultyDetails').value || null,
        tenancyNotice: document.getElementById('tenancyNotice').value || null,
        tenancyNoticeDetails: document.getElementById('tenancyNoticeDetails').value || null,
        rentalDispute: document.getElementById('rentalDispute').value || null,
        rentalDisputeDetails: document.getElementById('rentalDisputeDetails').value || null,
        grossIncome: document.getElementById('grossIncome').value,
        creditConsent: document.getElementById('creditConsent').value,
        employmentStatus: document.getElementById('employmentStatus').value,
        profession: document.getElementById('profession').value || null,
        employmentDuration: document.getElementById('employmentDuration').value || null,
        businessActivity: document.getElementById('businessActivity').value,
        businessActivityDetails: document.getElementById('businessActivityDetails').value || null,
        vehicles: document.getElementById('vehicles').value,
        specialVehicles: document.getElementById('specialVehicles').value,
        specialVehiclesDetails: document.getElementById('specialVehiclesDetails').value || null,
        additionalInfo: document.getElementById('additionalInfo').value || null,
        declaration1: document.getElementById('declaration1').checked,
        declaration2: document.getElementById('declaration2').checked,
    };

    showOverlay();
    fetch(baseUrl + '/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showThankYouScreen(data.message);
        } else {
            showAlert(data.message || 'Failed to submit application.', 'danger');
        }
    })
    .catch(error => showAlert('An error occurred: ' + error.message, 'danger'))
    .finally(hideOverlay);
}

// Restore minimum 5-character validation for required textareas
document.querySelectorAll('textarea[required]').forEach(textarea => {
    textarea.addEventListener('input', function () {
        if (this.value.trim().length < 5) {
            this.setCustomValidity('Please provide at least 5 characters.');
        } else {
            this.setCustomValidity('');
        }
    });
});
