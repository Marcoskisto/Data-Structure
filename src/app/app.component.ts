import { Component } from '@angular/core';
import { SortingComponent } from './pages/sorts/sorting.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SortingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 
}