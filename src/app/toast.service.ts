import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast$ = new BehaviorSubject<{ message: string; type: 'success' | 'error'; show: boolean }>({ message: '', type: 'success', show: false });

  show(message: string, type: 'success' | 'error' = 'success') {
    this.toast$.next({ message, type, show: true });
    setTimeout(() => this.toast$.next({ ...this.toast$.value, show: false }), 3000);
  }
}
