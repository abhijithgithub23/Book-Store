import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookDetailComponent } from './components/book-detail/book-detail.component';
import { CartComponent } from './components/cart/cart.component'; 

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'genre/:genre', component: BookListComponent },
  { path: 'search/:query', component: BookListComponent },
  { path: 'book/:id', component: BookDetailComponent },
  { path: 'cart', component: CartComponent }, 
  { path: '**', redirectTo: '' }
];