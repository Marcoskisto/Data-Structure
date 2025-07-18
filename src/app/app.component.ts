import { Component } from '@angular/core';
import { SortingComponent } from './pages/sorts/sorting.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SortingComponent, NgbNavModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 
}