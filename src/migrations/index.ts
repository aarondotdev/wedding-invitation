import * as migration_20261018_130946_initial from './20261018_130946_initial';
import * as migration_20261018_133536_cms_editable_content from './20261018_133536_cms_editable_content';
import * as migration_20261018_140226_editorial_redesign from './20261018_140226_editorial_redesign';
import * as migration_20261018_144910_invitation_details from './20261018_144910_invitation_details';
import * as migration_20261018_155456_rsvp_choice_cards from './20261018_155456_rsvp_choice_cards';
import * as migration_20261018_164253_header_menu_labels from './20261018_164253_header_menu_labels';
import * as migration_20261031_091101_add_custom_section from './20261031_091101_add_custom_section';
import * as migration_20261102_010150_add_wishes from './20261102_010150_add_wishes';
import * as migration_20261103_233611_add_cover_title from './20261103_233611_add_cover_title';
import * as migration_20261103_235052_add_cover_photo from './20261103_235052_add_cover_photo';
import * as migration_20261104_002956_add_banner_photo from './20261104_002956_add_banner_photo';
import * as migration_20261104_010518_add_little_ones_title from './20261104_010518_add_little_ones_title';
import * as migration_20261104_011138_add_entourage_photo from './20261104_011138_add_entourage_photo';
import * as migration_20261104_013146_add_secondary_title from './20261104_013146_add_secondary_title';
import * as migration_20261110_081111_cover_title_exclamation from './20261110_081111_cover_title_exclamation';
import * as migration_20261110_092840_entourage_intro_honor from './20261110_092840_entourage_intro_honor';
import * as migration_20261110_093308_gallery_intro_favorite from './20261110_093308_gallery_intro_favorite';
import * as migration_20261111_235915_rsvp_message_placeholder from './20261111_235915_rsvp_message_placeholder';
import * as migration_20261112_032259_rsvp_submit_response from './20261112_032259_rsvp_submit_response';

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
    name: '20261018_155456_rsvp_choice_cards',
  },
  {
    up: migration_20261018_164253_header_menu_labels.up,
    down: migration_20261018_164253_header_menu_labels.down,
    name: '20261018_164253_header_menu_labels',
  },
  {
    up: migration_20261031_091101_add_custom_section.up,
    down: migration_20261031_091101_add_custom_section.down,
    name: '20261031_091101_add_custom_section',
  },
  {
    up: migration_20261102_010150_add_wishes.up,
    down: migration_20261102_010150_add_wishes.down,
    name: '20261102_010150_add_wishes',
  },
  {
    up: migration_20261103_233611_add_cover_title.up,
    down: migration_20261103_233611_add_cover_title.down,
    name: '20261103_233611_add_cover_title',
  },
  {
    up: migration_20261103_235052_add_cover_photo.up,
    down: migration_20261103_235052_add_cover_photo.down,
    name: '20261103_235052_add_cover_photo',
  },
  {
    up: migration_20261104_002956_add_banner_photo.up,
    down: migration_20261104_002956_add_banner_photo.down,
    name: '20261104_002956_add_banner_photo',
  },
  {
    up: migration_20261104_010518_add_little_ones_title.up,
    down: migration_20261104_010518_add_little_ones_title.down,
    name: '20261104_010518_add_little_ones_title',
  },
  {
    up: migration_20261104_011138_add_entourage_photo.up,
    down: migration_20261104_011138_add_entourage_photo.down,
    name: '20261104_011138_add_entourage_photo',
  },
  {
    up: migration_20261104_013146_add_secondary_title.up,
    down: migration_20261104_013146_add_secondary_title.down,
    name: '20261104_013146_add_secondary_title',
  },
  {
    up: migration_20261110_081111_cover_title_exclamation.up,
    down: migration_20261110_081111_cover_title_exclamation.down,
    name: '20261110_081111_cover_title_exclamation',
  },
  {
    up: migration_20261110_092840_entourage_intro_honor.up,
    down: migration_20261110_092840_entourage_intro_honor.down,
    name: '20261110_092840_entourage_intro_honor',
  },
  {
    up: migration_20261110_093308_gallery_intro_favorite.up,
    down: migration_20261110_093308_gallery_intro_favorite.down,
    name: '20261110_093308_gallery_intro_favorite',
  },
  {
    up: migration_20261111_235915_rsvp_message_placeholder.up,
    down: migration_20261111_235915_rsvp_message_placeholder.down,
    name: '20261111_235915_rsvp_message_placeholder',
  },
  {
    up: migration_20261112_032259_rsvp_submit_response.up,
    down: migration_20261112_032259_rsvp_submit_response.down,
    name: '20261112_032259_rsvp_submit_response'
  },
];
