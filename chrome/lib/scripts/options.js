import BackStore from './core/background-store';

const setupUserSettings = (userSettings) => {
    document.getElementById('email-input').value = userSettings.email || '';
    document.getElementById('time-input').value = userSettings.trackingTime;
    displayTrackings(userSettings.trackings);
};

const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

document.getElementById('save-user-settings')
    .addEventListener('click', (event) => {
        let email = document.getElementById('email-input').value;
        let trackingTime = document.getElementById('time-input').value;
        let userSettings = {
            email: email,
            trackingTime: trackingTime
        };
        if (validEmail.test(email)) {
            displayTrackingTimeWarning(trackingTime);
            BackStore.SaveUserSettings(userSettings, initOptions);
        } else {
            document.getElementById('email-error').innerHTML = 'Invalid email';
        }
    });

document.getElementById('email-input')
    .addEventListener('focus', (event) => {
        document.getElementById('email-error').innerHTML = '';
    });

const displayTrackings = (trackings) => {
    let innerTable = '';
    if (!trackings || !trackings.length) {
        innerTable = '<tr><td colspan="5" class="text-center">' +
            'Please add what you need to track. Watch how to do it in this video.</td></tr>';
    } else {
        innerTable = trackings.map(trackingRow).join('');
    }
    document.getElementById('trackings-tbody').innerHTML = innerTable;
};

const trackingRow = ({ img, url, lastScanStatus, isEnabled }) =>
    `<tr>
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
      <button class="btn btn-danger" type="button">X</button>
    </td>
  </tr>`;

const displayTrackingTimeWarning = (trackingTime) => {
    document.getElementById('tracking-time-warning').classList.remove('none');
    const timeText = trackingTime === '1' ? 'minute' : `${trackingTime} minutes`;
    const warning = `<p>  We will track your sites every ${timeText} ` +
      'if your browser is open. Otherwise, we will notify as soon as we notice a change by email. </p>';
    document.getElementById('tracking-time-warning').innerHTML = warning;
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
