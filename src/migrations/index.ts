import * as migration_20261018_130946_initial from './20261018_130946_initial';
import * as migration_20261018_133536_cms_editable_content from './20261018_133536_cms_editable_content';

export const migrations = [
  {
    up: migration_20261018_130946_initial.up,
    down: migration_20261018_130946_initial.down,
    name: '20261018_130946_initial',
  },
  {
    up: migration_20261018_133536_cms_editable_content.up,
    down: migration_20261018_133536_cms_editable_content.down,
    name: '20261018_133536_cms_editable_content'
  },
];
