import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-auth',
  template: ''
})
export class AuthComponent {
  /* eslint-disable */
  private sessionStorageItems = {
    access_token: '',
    granted_scopes: ['https://vwt-d-gew1-ns-surveys-e2e/.default'],
    access_token_stored_at: new Date().getTime(),
    expires_at: new Date().getTime(),
    id_token: '',
    id_token_claims_obj: {},
    id_token_expires_at: new Date().getTime(),
    id_token_stored_at: new Date().getTime()
  };
  /* eslint-enable */

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private oauthService: OAuthService
  ) {
    console.log('e2e auth helper initializing');
    const helper = new JwtHelperService();
    let isAuthorised = false;

    this.fillFromSessionStorage();

    this.route.paramMap.subscribe(params => {
      if (params.get('authBody') !== '') {
        const authBody = JSON.parse(decodeURI(params.get('authBody')));

        if (authBody && authBody.access_token && authBody.expires_in) {
          const accessToken = authBody.access_token;
          const expiresIn = authBody.expires_in;

          // SAVE ACCESS TOKEN
          /* eslint-disable */
          const decodedToken = helper.decodeToken(accessToken);
          this.sessionStorageItems.id_token_claims_obj = decodedToken;
          (this.sessionStorageItems as any).id_token_claims_obj._roles = ['surveys.read'];
          (this.sessionStorageItems as any).id_token_claims_obj._email = 'opensource@vwt.digital';
          this.sessionStorageItems.access_token = accessToken;
          this.sessionStorageItems.id_token = accessToken;

          // SET EXPIRATION TIME
          const expiresAt = (expiresIn.toString().length <= 6 ? expiresIn * 1000 : expiresIn);
          this.sessionStorageItems.expires_at = this.sessionStorageItems.expires_at + expiresAt;
          this.sessionStorageItems.id_token_expires_at = this.sessionStorageItems.id_token_expires_at + expiresAt;
          /* eslint-enable */

          this.fillSessionStorage();

          // CHECK IF ACCESS TOKEN IS VALID
          if (this.oauthService.hasValidAccessToken()) {
            // this.router.navigate(['/']);
            isAuthorised = true;
          }
        }
      }

      if (isAuthorised) {
        this.router.navigate(['/']);
      } else {
        this.oauthService.initImplicitFlow();
      }
    });
  }

  private fillSessionStorage() {
    // SAVE TO SESSION STORAGE
    for (const key in this.sessionStorageItems) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.sessionStorageItems.hasOwnProperty(key)) {
        const value = (
          typeof this.sessionStorageItems[key] === 'string'
            ? this.sessionStorageItems[key]
            : JSON.stringify(this.sessionStorageItems[key]));

        sessionStorage.setItem(key, value);
      }
    }
  }

  private fillFromSessionStorage() {
    for (const key in this.sessionStorageItems) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.sessionStorageItems.hasOwnProperty(key)) {
        const value = (
          typeof this.sessionStorageItems[key] === 'string'
            ? sessionStorage.getItem(key)
            : JSON.parse(sessionStorage.getItem(key))
        );
      }
    }
  }
}
