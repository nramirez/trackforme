import BackStore from './background-store';

const setupEmail = (email) => document.getElementById('email-input').value = email;
const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

document.querySelector('#save-user-settings')
    .addEventListener('click', function(event) {
        let email = document.getElementById('email-input').value;
        if (validEmail.test(email)) {
            BackStore.SaveUserSettings(email);
        } else {
            document.getElementById('email-error').innerHTML = 'Invalid email';
        }
    });

document.querySelector('#email-input')
    .addEventListener('focus', function(event) {
        document.getElementById('email-error').innerHTML = '';
    });

function displaySites(sites) {
    let innerTable = '';
    if (!sites || Object.keys(sites).length == 0) {
        innerTable = '<tr><td colspan="2">Please add your sites.</td></tr>';
    } else {
        for (let k in sites) {
            let site = sites[k];
            innerTable += sideRow(site.img, site.url);
        }
    }
    document.getElementById('sites-tbody').innerHTML = innerTable;
}

const sideRow = (previewUrl, siteUrl) =>
    `<tr>
    <td>
      <img class="img-preview" src="${previewUrl}" />
    </td>
    <td>
      ${siteUrl}
    </td>
    <td class="td-without-border">
      <button class="cancel-btn" type="button">X</button>
    </td>
  </tr>`;

BackStore.Load(function(response) {
    setupEmail(response.config.email);
    displaySites(response.config.sites);
});
