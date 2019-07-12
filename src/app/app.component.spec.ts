import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientModule } from '@angular/common/http';

import { OAuthService, UrlHelperService, OAuthLogger } from 'angular-oauth2-oidc';
import { AuthGuard } from './auth/auth.guard';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';

import { EnvServiceProvider } from './services/env.service.provider';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      declarations: [
        AppComponent,
        HeaderComponent
      ],
      providers: [
        EnvServiceProvider,
        OAuthService,
        AuthGuard,
        UrlHelperService,
        OAuthLogger
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
