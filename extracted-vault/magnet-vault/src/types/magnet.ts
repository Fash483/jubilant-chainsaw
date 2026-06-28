export interface MagnetLink {
  id: string;
  title: string;
  magnet: string;
  created_date: string;
  updated_date: string;
}

export interface Filters {
  show: string;
  term: string;
  or: string;
  only: string;
  except: string;
  hideCount: string;
  hidePosition: 'top' | 'bottom';
  splitCount: string;
  perGroup: string;
}

export interface DedupeSettings {
  mode: 'priority' | 'keep-first' | 'keep-second';
  removePhrase: string;
}

export const DEFAULT_FILTERS: Filters = {
  show: '',
  term: '',
  or: '',
  only: '',
  except: '',
  hideCount: '',
  hidePosition: 'top',
  splitCount: '',
  perGroup: '',
};

export const DEFAULT_DEDUPE: DedupeSettings = {
  mode: 'priority',
  removePhrase: '',
};

export const DEFAULT_PRIORITY_WORDS = [
  '2160p', '4k', '1080p', 'bluray', 'remux', 'web-dl', 'webrip', '720p',
];
