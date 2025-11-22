import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { HomeComponent } from './home/home.component';
import { FeaturesComponent } from './pages/features/features.component';
import { SolutionsComponent } from './pages/solutions/solutions.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { AboutComponent } from './pages/about/about.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'board', component: BoardComponent, canActivate: [authGuard] },
  { path: 'signup', component: SignupComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'solutions', component: SolutionsComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' },
];
