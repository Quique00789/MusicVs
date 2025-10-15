import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Remove FOUC hiding: mark body as loaded so CSS shows content
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('loaded');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  })
  .catch((err) => console.error(err));
