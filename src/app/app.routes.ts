import { Routes } from '@angular/router';
import { InicioComponent } from './paginas/vista/inicio/inicio.component';
import { VistaComponent } from './paginas/vista/vista.component';
import { PageNotFoundComponent } from './paginas/page-not-found/page-not-found.component';
import { AboutComponent } from './paginas/vista/about/about.component';
import { CuentaComponent } from './paginas/vista/cuenta/cuenta.component';
import { authGuard } from './core/auth/guards/auth.guard';
export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./paginas/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Iniciar sesión',
      },
      {
        path: 'register',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Registrarse',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import(
            './paginas/auth/forgot-password/forgot-password.component'
          ).then((m) => m.ForgotPasswordComponent),
        title: 'Recuperar contraseña',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./paginas/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
        title: 'Restablecer contraseña',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      /* {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      }, */
    ],
  },
  {
    path: '',
    component: VistaComponent,
    children: [
      {
        path: '',
        component: InicioComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'cuenta',
        canActivate: [authGuard],
        component: CuentaComponent,
      },
      {
        path: '**',
        component: PageNotFoundComponent,
      },
    ],
  },
];
