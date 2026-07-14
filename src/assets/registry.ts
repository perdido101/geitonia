// AUTO-GENERATED asset registry — the single source of truth for every asset path.
// RULE 2: every visual is a <Placeholder assetKey="..." />. Never hardcode an image
// path anywhere else. Real art gets swapped in later by editing this file and nothing else.
//
// 331 keys total (see SPEC.md §10). All values are '' until real art is dropped in;
// getAsset() returns null for empty entries, signalling "use the Placeholder".

export type AssetKey =
  | 'bg_kafeneio' | 'bg_fournos' | 'bg_souvlatzidiko' | 'bg_periptero'
  | 'bg_zacharoplasteio' | 'bg_psarotaverna' | 'bg_mezedopoleio' | 'icon_kafeneio'
  | 'icon_fournos' | 'icon_souvlatzidiko' | 'icon_periptero' | 'icon_zacharoplasteio'
  | 'icon_psarotaverna' | 'icon_mezedopoleio' | 'sign_kafeneio' | 'sign_fournos'
  | 'sign_souvlatzidiko' | 'sign_periptero' | 'sign_zacharoplasteio' | 'sign_psarotaverna'
  | 'sign_mezedopoleio' | 'st_briki_idle' | 'st_briki_working' | 'st_briki_ready'
  | 'st_briki_burnt' | 'st_frapiera_idle' | 'st_frapiera_working' | 'st_frapiera_ready'
  | 'st_frapiera_burnt' | 'st_espresso_idle' | 'st_espresso_working' | 'st_espresso_ready'
  | 'st_espresso_burnt' | 'st_oven_idle' | 'st_oven_working' | 'st_oven_ready'
  | 'st_oven_burnt' | 'st_dough_idle' | 'st_dough_working' | 'st_dough_ready'
  | 'st_dough_burnt' | 'st_gyros_idle' | 'st_gyros_working' | 'st_gyros_ready'
  | 'st_gyros_burnt' | 'st_grill_idle' | 'st_grill_working' | 'st_grill_ready'
  | 'st_grill_burnt' | 'st_wrap_idle' | 'st_wrap_working' | 'st_wrap_ready'
  | 'st_wrap_burnt' | 'st_fryer_idle' | 'st_fryer_working' | 'st_fryer_ready'
  | 'st_fryer_burnt' | 'st_fridge_idle' | 'st_fridge_working' | 'st_fridge_ready'
  | 'st_fridge_burnt' | 'st_shelf_idle' | 'st_shelf_working' | 'st_shelf_ready'
  | 'st_shelf_burnt' | 'st_register_idle' | 'st_register_working' | 'st_register_ready'
  | 'st_register_burnt' | 'st_mixer_idle' | 'st_mixer_working' | 'st_mixer_ready'
  | 'st_mixer_burnt' | 'st_syrup_idle' | 'st_syrup_working' | 'st_syrup_ready'
  | 'st_syrup_burnt' | 'st_ice_idle' | 'st_ice_working' | 'st_ice_ready'
  | 'st_ice_burnt' | 'st_clean_idle' | 'st_clean_working' | 'st_clean_ready'
  | 'st_clean_burnt' | 'st_meze_idle' | 'st_meze_working' | 'st_meze_ready'
  | 'st_meze_burnt' | 'st_ouzo_idle' | 'st_ouzo_working' | 'st_ouzo_ready'
  | 'st_ouzo_burnt' | 'it_ellinikos' | 'it_frape' | 'it_freddo_espresso'
  | 'it_freddo_cappuccino' | 'it_nescafe' | 'it_soda' | 'it_tiropita'
  | 'it_spanakopita' | 'it_bougatsa' | 'it_koulouri' | 'it_psomi'
  | 'it_ladopsomo' | 'it_kritsinia' | 'it_pita_gyros' | 'it_pita_souvlaki'
  | 'it_pita_apola' | 'it_merida_gyros' | 'it_patates' | 'it_tzatziki'
  | 'it_kalamaki' | 'it_tsigara' | 'it_nero' | 'it_frigania'
  | 'it_gum' | 'it_efimerida' | 'it_lachio' | 'it_pagoto'
  | 'it_galaktoboureko' | 'it_baklava' | 'it_kataifi' | 'it_ekmek'
  | 'it_profiterol' | 'it_tourta' | 'it_loukoumades' | 'it_gavros'
  | 'it_barbouni' | 'it_kalamaraki' | 'it_htapodi' | 'it_tsipoura'
  | 'it_horiatiki' | 'it_ouzo_glass' | 'it_saganaki' | 'it_dolmadakia'
  | 'it_keftedakia' | 'it_fava' | 'it_taramas' | 'it_melitzanosalata'
  | 'it_pikilia' | 'it_karafaki' | 'cu_pappous_idle' | 'cu_pappous_angry'
  | 'cu_pappous_happy' | 'cu_giagia_idle' | 'cu_giagia_angry' | 'cu_giagia_happy'
  | 'cu_mathitis_idle' | 'cu_mathitis_angry' | 'cu_mathitis_happy' | 'cu_taxitzis_idle'
  | 'cu_taxitzis_angry' | 'cu_taxitzis_happy' | 'cu_ypallilos_idle' | 'cu_ypallilos_angry'
  | 'cu_ypallilos_happy' | 'cu_touristas_idle' | 'cu_touristas_angry' | 'cu_touristas_happy'
  | 'cu_mama_idle' | 'cu_mama_angry' | 'cu_mama_happy' | 'cu_parea_idle'
  | 'cu_parea_angry' | 'cu_parea_happy' | 'cu_ergatis_idle' | 'cu_ergatis_angry'
  | 'cu_ergatis_happy' | 'cu_kyria_skylo_idle' | 'cu_kyria_skylo_angry' | 'cu_kyria_skylo_happy'
  | 'rg_thanasis_idle' | 'rg_thanasis_angry' | 'rg_thanasis_happy' | 'rg_thanasis_portrait'
  | 'rg_voula_idle' | 'rg_voula_angry' | 'rg_voula_happy' | 'rg_voula_portrait'
  | 'rg_mitsos_idle' | 'rg_mitsos_angry' | 'rg_mitsos_happy' | 'rg_mitsos_portrait'
  | 'rg_eleni_idle' | 'rg_eleni_angry' | 'rg_eleni_happy' | 'rg_eleni_portrait'
  | 'rg_panagiotis_idle' | 'rg_panagiotis_angry' | 'rg_panagiotis_happy' | 'rg_panagiotis_portrait'
  | 'rg_roula_idle' | 'rg_roula_angry' | 'rg_roula_happy' | 'rg_roula_portrait'
  | 'rg_spyros_idle' | 'rg_spyros_angry' | 'rg_spyros_happy' | 'rg_spyros_portrait'
  | 'rg_kostas_idle' | 'rg_kostas_angry' | 'rg_kostas_happy' | 'rg_kostas_portrait'
  | 'bg_map_geitonia' | 'av_walk_n_1' | 'av_walk_n_2' | 'av_walk_n_3'
  | 'av_walk_n_4' | 'av_walk_s_1' | 'av_walk_s_2' | 'av_walk_s_3'
  | 'av_walk_s_4' | 'av_walk_e_1' | 'av_walk_e_2' | 'av_walk_e_3'
  | 'av_walk_e_4' | 'av_walk_w_1' | 'av_walk_w_2' | 'av_walk_w_3'
  | 'av_walk_w_4' | 'av_idle_n' | 'av_idle_s' | 'av_idle_e'
  | 'av_idle_w' | 'poi_plateia' | 'poi_laiki' | 'poi_trapeza'
  | 'poi_ekklisia' | 'poi_spiti' | 'poi_eforia' | 'poi_paralia'
  | 'poi_steno' | 'poi_kleisto' | 'ui_poleitai' | 'ui_node_locked'
  | 'ui_node_open' | 'ui_node_event' | 'ui_map_hud' | 'ui_dialogue_box'
  | 'ui_map_compass' | 'ui_patience_bar_frame' | 'ui_patience_fill' | 'ui_rep_bar_frame'
  | 'ui_rep_fill' | 'ui_timer_ring' | 'ui_coin' | 'ui_euro'
  | 'ui_star' | 'ui_lock' | 'ui_check' | 'ui_x'
  | 'ui_speech_bubble' | 'ui_order_ticket' | 'ui_button_primary' | 'ui_button_secondary'
  | 'ui_panel_bg' | 'ui_modal_bg' | 'ui_map_bg' | 'ui_map_node_locked'
  | 'ui_map_node_unlocked' | 'ui_map_path' | 'ui_calendar_bg' | 'ui_month_card'
  | 'ui_upgrade_slot' | 'ui_upgrade_locked' | 'ui_shift_summary_bg' | 'ui_logo'
  | 'ui_title_bg' | 'ui_settings_gear' | 'ui_flag_el' | 'ui_flag_en'
  | 'up_kafeneio_speed' | 'up_kafeneio_capacity' | 'up_kafeneio_quality' | 'up_kafeneio_comfort'
  | 'up_fournos_speed' | 'up_fournos_capacity' | 'up_fournos_quality' | 'up_fournos_comfort'
  | 'up_souvlatzidiko_speed' | 'up_souvlatzidiko_capacity' | 'up_souvlatzidiko_quality' | 'up_souvlatzidiko_comfort'
  | 'up_periptero_speed' | 'up_periptero_capacity' | 'up_periptero_quality' | 'up_periptero_comfort'
  | 'up_zacharoplasteio_speed' | 'up_zacharoplasteio_capacity' | 'up_zacharoplasteio_quality' | 'up_zacharoplasteio_comfort'
  | 'up_psarotaverna_speed' | 'up_psarotaverna_capacity' | 'up_psarotaverna_quality' | 'up_psarotaverna_comfort'
  | 'up_mezedopoleio_speed' | 'up_mezedopoleio_capacity' | 'up_mezedopoleio_quality' | 'up_mezedopoleio_comfort'
  | 'mo_ianouarios' | 'mo_fevrouarios' | 'mo_martios' | 'mo_aprilios'
  | 'mo_maios' | 'mo_iounios' | 'mo_ioulios' | 'mo_avgoustos'
  | 'mo_septemvrios' | 'mo_oktovrios' | 'mo_noemvrios' | 'mo_dekemvrios'
  | 'sfx_tap' | 'sfx_serve_correct' | 'sfx_serve_wrong' | 'sfx_burn'
  | 'sfx_coin' | 'sfx_customer_arrive' | 'sfx_customer_angry' | 'sfx_customer_leave'
  | 'sfx_station_ready' | 'sfx_upgrade' | 'sfx_shift_end' | 'sfx_shop_unlock'
  | 'sfx_regular_arrive' | 'mus_title' | 'mus_shift_calm' | 'mus_shift_rush'
  | 'mus_meta' | 'mus_summer' | 'mus_winter';

export const registry: Record<AssetKey, string> = {
  bg_kafeneio: '',
  bg_fournos: '',
  bg_souvlatzidiko: '',
  bg_periptero: '',
  bg_zacharoplasteio: '',
  bg_psarotaverna: '',
  bg_mezedopoleio: '',
  icon_kafeneio: '',
  icon_fournos: '',
  icon_souvlatzidiko: '',
  icon_periptero: '',
  icon_zacharoplasteio: '',
  icon_psarotaverna: '',
  icon_mezedopoleio: '',
  sign_kafeneio: '',
  sign_fournos: '',
  sign_souvlatzidiko: '',
  sign_periptero: '',
  sign_zacharoplasteio: '',
  sign_psarotaverna: '',
  sign_mezedopoleio: '',
  st_briki_idle: '',
  st_briki_working: '',
  st_briki_ready: '',
  st_briki_burnt: '',
  st_frapiera_idle: '',
  st_frapiera_working: '',
  st_frapiera_ready: '',
  st_frapiera_burnt: '',
  st_espresso_idle: '',
  st_espresso_working: '',
  st_espresso_ready: '',
  st_espresso_burnt: '',
  st_oven_idle: '',
  st_oven_working: '',
  st_oven_ready: '',
  st_oven_burnt: '',
  st_dough_idle: '',
  st_dough_working: '',
  st_dough_ready: '',
  st_dough_burnt: '',
  st_gyros_idle: '',
  st_gyros_working: '',
  st_gyros_ready: '',
  st_gyros_burnt: '',
  st_grill_idle: '',
  st_grill_working: '',
  st_grill_ready: '',
  st_grill_burnt: '',
  st_wrap_idle: '',
  st_wrap_working: '',
  st_wrap_ready: '',
  st_wrap_burnt: '',
  st_fryer_idle: '',
  st_fryer_working: '',
  st_fryer_ready: '',
  st_fryer_burnt: '',
  st_fridge_idle: '',
  st_fridge_working: '',
  st_fridge_ready: '',
  st_fridge_burnt: '',
  st_shelf_idle: '',
  st_shelf_working: '',
  st_shelf_ready: '',
  st_shelf_burnt: '',
  st_register_idle: '',
  st_register_working: '',
  st_register_ready: '',
  st_register_burnt: '',
  st_mixer_idle: '',
  st_mixer_working: '',
  st_mixer_ready: '',
  st_mixer_burnt: '',
  st_syrup_idle: '',
  st_syrup_working: '',
  st_syrup_ready: '',
  st_syrup_burnt: '',
  st_ice_idle: '',
  st_ice_working: '',
  st_ice_ready: '',
  st_ice_burnt: '',
  st_clean_idle: '',
  st_clean_working: '',
  st_clean_ready: '',
  st_clean_burnt: '',
  st_meze_idle: '',
  st_meze_working: '',
  st_meze_ready: '',
  st_meze_burnt: '',
  st_ouzo_idle: '',
  st_ouzo_working: '',
  st_ouzo_ready: '',
  st_ouzo_burnt: '',
  it_ellinikos: '',
  it_frape: '',
  it_freddo_espresso: '',
  it_freddo_cappuccino: '',
  it_nescafe: '',
  it_soda: '',
  it_tiropita: '',
  it_spanakopita: '',
  it_bougatsa: '',
  it_koulouri: '',
  it_psomi: '',
  it_ladopsomo: '',
  it_kritsinia: '',
  it_pita_gyros: '',
  it_pita_souvlaki: '',
  it_pita_apola: '',
  it_merida_gyros: '',
  it_patates: '',
  it_tzatziki: '',
  it_kalamaki: '',
  it_tsigara: '',
  it_nero: '',
  it_frigania: '',
  it_gum: '',
  it_efimerida: '',
  it_lachio: '',
  it_pagoto: '',
  it_galaktoboureko: '',
  it_baklava: '',
  it_kataifi: '',
  it_ekmek: '',
  it_profiterol: '',
  it_tourta: '',
  it_loukoumades: '',
  it_gavros: '',
  it_barbouni: '',
  it_kalamaraki: '',
  it_htapodi: '',
  it_tsipoura: '',
  it_horiatiki: '',
  it_ouzo_glass: '',
  it_saganaki: '',
  it_dolmadakia: '',
  it_keftedakia: '',
  it_fava: '',
  it_taramas: '',
  it_melitzanosalata: '',
  it_pikilia: '',
  it_karafaki: '',
  cu_pappous_idle: '',
  cu_pappous_angry: '',
  cu_pappous_happy: '',
  cu_giagia_idle: '',
  cu_giagia_angry: '',
  cu_giagia_happy: '',
  cu_mathitis_idle: '',
  cu_mathitis_angry: '',
  cu_mathitis_happy: '',
  cu_taxitzis_idle: '',
  cu_taxitzis_angry: '',
  cu_taxitzis_happy: '',
  cu_ypallilos_idle: '',
  cu_ypallilos_angry: '',
  cu_ypallilos_happy: '',
  cu_touristas_idle: '',
  cu_touristas_angry: '',
  cu_touristas_happy: '',
  cu_mama_idle: '',
  cu_mama_angry: '',
  cu_mama_happy: '',
  cu_parea_idle: '',
  cu_parea_angry: '',
  cu_parea_happy: '',
  cu_ergatis_idle: '',
  cu_ergatis_angry: '',
  cu_ergatis_happy: '',
  cu_kyria_skylo_idle: '',
  cu_kyria_skylo_angry: '',
  cu_kyria_skylo_happy: '',
  rg_thanasis_idle: '',
  rg_thanasis_angry: '',
  rg_thanasis_happy: '',
  rg_thanasis_portrait: '',
  rg_voula_idle: '',
  rg_voula_angry: '',
  rg_voula_happy: '',
  rg_voula_portrait: '',
  rg_mitsos_idle: '',
  rg_mitsos_angry: '',
  rg_mitsos_happy: '',
  rg_mitsos_portrait: '',
  rg_eleni_idle: '',
  rg_eleni_angry: '',
  rg_eleni_happy: '',
  rg_eleni_portrait: '',
  rg_panagiotis_idle: '',
  rg_panagiotis_angry: '',
  rg_panagiotis_happy: '',
  rg_panagiotis_portrait: '',
  rg_roula_idle: '',
  rg_roula_angry: '',
  rg_roula_happy: '',
  rg_roula_portrait: '',
  rg_spyros_idle: '',
  rg_spyros_angry: '',
  rg_spyros_happy: '',
  rg_spyros_portrait: '',
  rg_kostas_idle: '',
  rg_kostas_angry: '',
  rg_kostas_happy: '',
  rg_kostas_portrait: '',
  bg_map_geitonia: '',
  av_walk_n_1: '',
  av_walk_n_2: '',
  av_walk_n_3: '',
  av_walk_n_4: '',
  av_walk_s_1: '',
  av_walk_s_2: '',
  av_walk_s_3: '',
  av_walk_s_4: '',
  av_walk_e_1: '',
  av_walk_e_2: '',
  av_walk_e_3: '',
  av_walk_e_4: '',
  av_walk_w_1: '',
  av_walk_w_2: '',
  av_walk_w_3: '',
  av_walk_w_4: '',
  av_idle_n: '',
  av_idle_s: '',
  av_idle_e: '',
  av_idle_w: '',
  poi_plateia: '',
  poi_laiki: '',
  poi_trapeza: '',
  poi_ekklisia: '',
  poi_spiti: '',
  poi_eforia: '',
  poi_paralia: '',
  poi_steno: '',
  poi_kleisto: '',
  ui_poleitai: '',
  ui_node_locked: '',
  ui_node_open: '',
  ui_node_event: '',
  ui_map_hud: '',
  ui_dialogue_box: '',
  ui_map_compass: '',
  ui_patience_bar_frame: '',
  ui_patience_fill: '',
  ui_rep_bar_frame: '',
  ui_rep_fill: '',
  ui_timer_ring: '',
  ui_coin: '',
  ui_euro: '',
  ui_star: '',
  ui_lock: '',
  ui_check: '',
  ui_x: '',
  ui_speech_bubble: '',
  ui_order_ticket: '',
  ui_button_primary: '',
  ui_button_secondary: '',
  ui_panel_bg: '',
  ui_modal_bg: '',
  ui_map_bg: '',
  ui_map_node_locked: '',
  ui_map_node_unlocked: '',
  ui_map_path: '',
  ui_calendar_bg: '',
  ui_month_card: '',
  ui_upgrade_slot: '',
  ui_upgrade_locked: '',
  ui_shift_summary_bg: '',
  ui_logo: '',
  ui_title_bg: '',
  ui_settings_gear: '',
  ui_flag_el: '',
  ui_flag_en: '',
  up_kafeneio_speed: '',
  up_kafeneio_capacity: '',
  up_kafeneio_quality: '',
  up_kafeneio_comfort: '',
  up_fournos_speed: '',
  up_fournos_capacity: '',
  up_fournos_quality: '',
  up_fournos_comfort: '',
  up_souvlatzidiko_speed: '',
  up_souvlatzidiko_capacity: '',
  up_souvlatzidiko_quality: '',
  up_souvlatzidiko_comfort: '',
  up_periptero_speed: '',
  up_periptero_capacity: '',
  up_periptero_quality: '',
  up_periptero_comfort: '',
  up_zacharoplasteio_speed: '',
  up_zacharoplasteio_capacity: '',
  up_zacharoplasteio_quality: '',
  up_zacharoplasteio_comfort: '',
  up_psarotaverna_speed: '',
  up_psarotaverna_capacity: '',
  up_psarotaverna_quality: '',
  up_psarotaverna_comfort: '',
  up_mezedopoleio_speed: '',
  up_mezedopoleio_capacity: '',
  up_mezedopoleio_quality: '',
  up_mezedopoleio_comfort: '',
  mo_ianouarios: '',
  mo_fevrouarios: '',
  mo_martios: '',
  mo_aprilios: '',
  mo_maios: '',
  mo_iounios: '',
  mo_ioulios: '',
  mo_avgoustos: '',
  mo_septemvrios: '',
  mo_oktovrios: '',
  mo_noemvrios: '',
  mo_dekemvrios: '',
  sfx_tap: '',
  sfx_serve_correct: '',
  sfx_serve_wrong: '',
  sfx_burn: '',
  sfx_coin: '',
  sfx_customer_arrive: '',
  sfx_customer_angry: '',
  sfx_customer_leave: '',
  sfx_station_ready: '',
  sfx_upgrade: '',
  sfx_shift_end: '',
  sfx_shop_unlock: '',
  sfx_regular_arrive: '',
  mus_title: '',
  mus_shift_calm: '',
  mus_shift_rush: '',
  mus_meta: '',
  mus_summer: '',
  mus_winter: '',
};

/**
 * Returns the asset path for a key, or null when no real asset is registered yet
 * (signalling the UI to render a <Placeholder />).
 */
export function getAsset(key: AssetKey): string | null {
  const path = registry[key];
  return path && path.length > 0 ? path : null;
}

/** All registered asset keys, handy for validation and tooling. */
export const ALL_ASSET_KEYS = Object.keys(registry) as AssetKey[];
