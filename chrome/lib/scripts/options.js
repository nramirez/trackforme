import BackStore from './core/background-store';

const setupUserSettings = (userSettings) => {
    if (userSettings.email) {
        document.getElementById('email-input').value = userSettings.email;
        document.getElementById('time-input').value = userSettings.trackingTime;
    }
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
            BackStore.SaveUserSettings(userSettings);
        } else {
            document.getElementById('email-error').innerHTML = 'Invalid email';
        }
    });

document.getElementById('email-input')
    .addEventListener('focus', (event) => {
        document.getElementById('email-error').innerHTML = '';
    });

document.getElementById('tracking-tigger')
    .addEventListener('click', (e) => {
        BackStore.RunTracking();
    });

function displayTrackings(trackings) {
    let innerTable = '';
    if (!trackings || Object.keys(trackings).length == 0) {
        innerTable = '<tr><td colspan="2">Please add what you need to track. Watch how to do it in this video.</td></tr>';
    } else {
        for (let k in trackings) {
            let tracking = trackings[k];
            innerTable += trackingRow(tracking.img, tracking.url);
        }
    }
    document.getElementById('trackings-tbody').innerHTML = innerTable;
}

const trackingRow = (imgUrl, url) =>
    `<tr>
    <td>
      <img class="img-preview" src="${imgUrl}" />
    </td>
    <td>
      ${url}
    </td>
    <td class="td-without-border">
      <button class="cancel-btn" type="button">X</button>
    </td>
  </tr>`;

const displayTrackingTimeWarning = (trackingTime) => {
    document.getElementById('tracking-time-warning').classList.remove('hide');
    const part1 = '<p>  We will track your sites every <b> ' + trackingTime;
    const part2 = ' </b> minutes if your browser is open. Otherwise, we will notify as soon as we can by email. </p> ';
    const warning = part1 + part2;
    document.getElementById('tracking-time-warning').innerHTML = warning;
};

BackStore.LoadUserSettings((response) => {
    setupUserSettings(response.config);
});
