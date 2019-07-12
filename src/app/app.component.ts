import { Component, ViewChild } from '@angular/core';

import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { EnvService } from './services/env.service';
import { AuthComponent } from './auth/auth.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  // @ViewChild(AuthComponent) authHelper: AuthComponent;
  constructor(
    private env: EnvService,
    private oauthService: OAuthService
  ) {
    const config = new AuthConfig();
    config.loginUrl = env.loginUrl;
    config.redirectUri = window.location.origin + '/index.html';
    config.logoutUrl = env.logoutUrl;
    config.clientId = env.clientId;
    config.scope = env.scope;
    config.issuer = env.issuer;
    config.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';

    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.tryLogin({});
  }

  get hasValidAccessToken() {
    if (this.oauthService.hasValidAccessToken()) {
      return true;
    }
    return false;
  }
}
