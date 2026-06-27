import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['expectedRoles'] as Array<string>;
  if (expectedRoles && expectedRoles.length > 0) {
    if (!authService.hasRole(expectedRoles)) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
