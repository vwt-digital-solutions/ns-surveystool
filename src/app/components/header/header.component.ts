import { Component } from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';

interface ClaimsEmail {
  email: any;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  title = 'NS Surveys';

  constructor(
    private oauthService: OAuthService
  ) {}

  logout() {
    this.oauthService.logOut();
  }

  get email() {
    const claims = this.oauthService.getIdentityClaims() as ClaimsEmail;
    if (!claims) {
      return null;
    }
    return claims.email;
  }
}
