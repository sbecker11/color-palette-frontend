import { ApiClient } from './api';

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ApiClient;
  }
}

export {};