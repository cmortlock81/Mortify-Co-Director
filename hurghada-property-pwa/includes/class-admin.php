<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Admin {
    public function __construct(private HPPWA_Listings $listings, private HPPWA_PWA $pwa, private HPPWA_Firebase $firebase) {}
    public function init(): void { add_action('admin_menu', [$this, 'menu']); add_action('admin_init', [$this, 'save']); add_action('admin_enqueue_scripts', [$this, 'media']); }
    public function menu(): void { add_menu_page('Hurghada PWA', 'Hurghada PWA', 'manage_options', 'hurghada-pwa', [$this, 'page'], 'dashicons-smartphone', 58); }
    public function media(string $hook): void { if ($hook === 'toplevel_page_hurghada-pwa') { wp_enqueue_media(); } }
    public function save(): void {
        if (!isset($_POST['hppwa_save']) || !current_user_can('manage_options')) { return; }
        check_admin_referer('hppwa_save_settings');
        $keys = array_keys(HPPWA_Plugin::defaults()); $settings = HPPWA_Plugin::settings();
        foreach ($keys as $key) { if (isset($_POST[$key])) { $settings[$key] = in_array($key, ['firebase_service_account','enquiry_shortcode'], true) ? wp_kses_post(wp_unslash($_POST[$key])) : sanitize_text_field(wp_unslash($_POST[$key])); } else if (str_starts_with($key, 'enable_') || $key === 'show_currency_labels') { $settings[$key] = '0'; } }
        HPPWA_Plugin::update_settings($settings); add_settings_error('hppwa', 'saved', 'Settings saved.', 'updated');
    }
    public function page(): void {
        if (!current_user_can('manage_options')) { return; }
        $tab = sanitize_key($_GET['tab'] ?? 'general'); $s = HPPWA_Plugin::settings(); settings_errors('hppwa');
        echo '<div class="wrap"><h1>Hurghada PWA</h1><nav class="nav-tab-wrapper">'; foreach (['general','listings','pwa','firebase','diagnostics'] as $t) { echo '<a class="nav-tab '.esc_attr($tab===$t?'nav-tab-active':'').'" href="'.esc_url(admin_url('admin.php?page=hurghada-pwa&tab='.$t)).'">'.esc_html(ucfirst($t)).'</a>'; } echo '</nav>';
        if ($tab === 'diagnostics') { $this->diagnostics(); echo '</div>'; return; }
        echo '<form method="post">'; wp_nonce_field('hppwa_save_settings'); echo '<table class="form-table"><tbody>';
        $fields = $this->fields($tab); foreach ($fields as $key=>$label) { $value = $s[$key] ?? ''; echo '<tr><th><label for="'.esc_attr($key).'">'.esc_html($label).'</label></th><td>'; if (str_starts_with($key,'enable_') || $key==='show_currency_labels') { echo '<input type="checkbox" name="'.esc_attr($key).'" value="1" '.checked($value,'1',false).'>'; } elseif ($key === 'firebase_service_account') { echo '<textarea class="large-text code" rows="8" name="'.esc_attr($key).'">'.esc_textarea($value).'</textarea>'; } else { echo '<input class="regular-text" type="text" name="'.esc_attr($key).'" value="'.esc_attr($value).'">'; } echo '</td></tr>'; }
        echo '</tbody></table><p><button class="button button-primary" name="hppwa_save" value="1">Save Settings</button></p></form></div>';
    }
    private function fields(string $tab): array { return match($tab) { 'listings'=>['property_post_type'=>'Property post type override','listings_per_page'=>'Listings per page','default_sort'=>'Default sort','show_currency_labels'=>'Show currency labels','whatsapp_template'=>'WhatsApp message template'], 'pwa'=>['enable_pwa'=>'Enable PWA','cache_version'=>'Cache version','offline_message'=>'Offline message','theme_colour'=>'Theme colour','background_colour'=>'Background colour'], 'firebase'=>['enable_firebase'=>'Enable Firebase','firebase_api_key'=>'Firebase API key','firebase_auth_domain'=>'Auth domain','firebase_project_id'=>'Project ID','firebase_storage_bucket'=>'Storage bucket','firebase_messaging_sender_id'=>'Messaging sender ID','firebase_app_id'=>'App ID','firebase_measurement_id'=>'Measurement ID','firebase_vapid_key'=>'VAPID key','firebase_service_account'=>'Service account JSON'], default=>['app_name'=>'App name','short_name'=>'Short name','logo_url'=>'Logo URL','whatsapp'=>'WhatsApp number','phone'=>'Phone','email'=>'Email','brand_colour'=>'Brand colour','enquiry_shortcode'=>'Enquiry form shortcode'], }; }
    private function diagnostics(): void { $count = wp_count_posts($this->listings->post_type()); echo '<table class="widefat striped"><tbody>'; foreach (['Detected property post type'=>$this->listings->post_type(),'Detected taxonomies'=>implode(', ', $this->listings->taxonomies()),'Published properties'=>(string)($count->publish ?? 0),'Manifest URL'=>home_url('/hurghada-pwa-manifest.json'),'Service worker URL'=>home_url('/hurghada-pwa-sw.js'),'Registered device count'=>(string)HPPWA_Database::count_tokens(),'Service worker status'=>'Root-scope route is registered; flush permalinks if the URL 404s.'] as $k=>$v) { echo '<tr><th>'.esc_html($k).'</th><td>'.esc_html($v).'</td></tr>'; } echo '</tbody></table>'; }
}
