import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './modules/home/home.component';
import { AuthComponent } from './auth/auth.component';

import { Role } from './models/role.enum';

const routes: Routes = [
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.Reader] }
    },
    {
      path: 'auth/:authBody',
      component: AuthComponent,
    },
    {
      path: '**',
      redirectTo: 'home'
    }
  ];

@NgModule({
    imports: [
      RouterModule.forRoot(routes
        // { enableTracing: true }
      )
    ],
    exports: [
      RouterModule
    ]
  })
  export class AppRoutingModule { }
