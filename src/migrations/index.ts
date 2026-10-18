import * as migration_20261018_130946_initial from './20261018_130946_initial';
import * as migration_20261018_133536_cms_editable_content from './20261018_133536_cms_editable_content';
import * as migration_20261018_140226_editorial_redesign from './20261018_140226_editorial_redesign';
import * as migration_20261018_144910_invitation_details from './20261018_144910_invitation_details';
import * as migration_20261018_155456_rsvp_choice_cards from './20261018_155456_rsvp_choice_cards';

export const migrations = [
  {
    up: migration_20261018_130946_initial.up,
    down: migration_20261018_130946_initial.down,
    name: '20261018_130946_initial',
  },
  {
    up: migration_20261018_133536_cms_editable_content.up,
    down: migration_20261018_133536_cms_editable_content.down,
    name: '20261018_133536_cms_editable_content',
  },
  {
    up: migration_20261018_140226_editorial_redesign.up,
    down: migration_20261018_140226_editorial_redesign.down,
    name: '20261018_140226_editorial_redesign',
  },
  {
    up: migration_20261018_144910_invitation_details.up,
    down: migration_20261018_144910_invitation_details.down,
    name: '20261018_144910_invitation_details',
  },
  {
    up: migration_20261018_155456_rsvp_choice_cards.up,
    down: migration_20261018_155456_rsvp_choice_cards.down,
    name: '20261018_155456_rsvp_choice_cards'
  },
];
