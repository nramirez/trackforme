import BackStore from './core/background-store';
import $ from 'jquery';

const setupUserSettings = (userSettings) => {
    if (userSettings.email) {
        $('#email-input').val(userSettings.email);
        $('#time-input').val(userSettings.trackingTime);
    }
    displayTrackings(userSettings.trackings);
    bindPageElements();
};

const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

$('#save-user-settings').click((event) => {
    let email = $('#email-input').val();
    let trackingTime = $('#time-input').val();
    if (validEmail.test(email)) {
        let userSettings = {
            email: email,
            trackingTime: trackingTime
        };
        displayTrackingTimeWarning(trackingTime);
        BackStore.SaveUserSettings(userSettings, initOptions);
    } else {
        $('#email-error').html('Invalid email');
    }
});

$('#email-input').focus((event) => {
    $('#email-error').html('');
});

const displayTrackings = (trackings) => {
    let innerTable = '';
    if (!trackings || !trackings.length) {
        innerTable = '<tr><td colspan="5" class="text-center">' +
            'Please add what you need to track. Watch how to do it in this video.</td></tr>';
    } else {
        innerTable = trackings.map(trackingRow).join('');
    }
    $('#trackings-tbody').html(innerTable);
};

let bindPageElements = () => {
    $('.btn-delete').click((event) => {
        let row = $(event.target.closest('tr'));
        let img = row.attr('data-img');
        BackStore.DeleteTracking(img, (res) => {
            if (res) {
                row.remove();
            } else {
                console.log('Unable to delete the tracking, contact TFM team if problem persist.');
            }
        });
    });
};

const trackingRow = ({
        img,
        url,
        lastScanStatus,
        isEnabled
    }) =>
    `<tr data-img="${img}">
        <td>
            <input title="Disable/Enable tracking" checked="${isEnabled}" type="checkbox">
        </td>
        <td class="text-center">
            ${lastScanStatus}
        </td>
        <td>
            <a href="${img}" target="_blank">
                <img class="img-preview" src="${img}" />
            </a>
        </td>
        <td>
            <a href="${url}" target="_blank">${url}</a>
        </td>
        <td class="td-without-border">
            <button class="btn btn-danger btn-delete" type="button">X</button>
        </td>
    </tr>`;

const displayTrackingTimeWarning = (trackingTime) => {
    $('#tracking-time-warning').removeClass('none');
    const timeText = trackingTime === '1' ? 'minute' : `${trackingTime} minutes`;
    const warning = `<p>  We will track your sites every ${timeText} ` +
        'if your browser is open. Otherwise, we will notify as soon as we notice a change by email. </p>';
    $('#tracking-time-warning').html(warning);
};

const initOptions = () => {
    BackStore.LoadUserSettings((response) => {
        setupUserSettings(response.config);
    });
};

initOptions();

//Temporal hack to call the runner
// Call window.Run() from the console
window.Run = () => {
    BackStore.RunTracking();
};
