import BackStore from './background-store';

function displaySites(sites) {
  let innerTable = '';
  if (!sites || Object.keys(sites).length == 0) {
    innerTable = '<tr><td colspan="2">Please add your sites.</td></tr>';
  } else {
    for(let k in sites) {
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

function setupEmail(email){
  if (!email) {
    document.getElementById('email-input').value = "Add your email";
  }
  else {
    document.getElementById('email-input').value = email;
  }

}


BackStore.Load(function(response){
  displaySites(response.config.sites);
  setupEmail(response.config.email);
});
