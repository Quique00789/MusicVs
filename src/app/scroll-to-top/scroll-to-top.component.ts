import { Component } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.css']
})
export class ScrollToTopComponent {
  // Función de scroll to top mantenida para uso programático
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
