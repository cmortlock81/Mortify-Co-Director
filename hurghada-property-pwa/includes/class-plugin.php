<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Plugin {
    private static ?HPPWA_Plugin $instance = null;
    public HPPWA_Listings $listings;
    public HPPWA_Routes $routes;
    public HPPWA_PWA $pwa;
    public HPPWA_Firebase $firebase;
    public HPPWA_Admin $admin;

    public static function instance(): HPPWA_Plugin {
        if (self::$instance === null) { self::$instance = new self(); }
        return self::$instance;
    }

    public function init(): void {
        $this->listings = new HPPWA_Listings();
        $this->pwa = new HPPWA_PWA();
        $this->firebase = new HPPWA_Firebase();
        $this->routes = new HPPWA_Routes($this->listings);
        $this->admin = new HPPWA_Admin($this->listings, $this->pwa, $this->firebase);
        $this->routes->init();
        $this->pwa->init();
        $this->firebase->init();
        if (is_admin()) { $this->admin->init(); }
    }

    public static function defaults(): array {
        return [
            'app_name' => 'Hurghada Property PWA', 'short_name' => 'Hurghada PWA',
            'logo_url' => '', 'whatsapp' => '', 'phone' => '', 'email' => get_option('admin_email'),
            'brand_colour' => '#007aff', 'theme_colour' => '#007aff', 'background_colour' => '#f5f7fb',
            'property_post_type' => '', 'listings_per_page' => 12, 'default_sort' => 'date_desc',
            'show_currency_labels' => '1', 'whatsapp_template' => 'Hi, I am interested in {title} ({url}).',
            'enable_pwa' => '1', 'cache_version' => '1', 'offline_message' => 'You are offline. Saved app pages remain available.',
            'enable_firebase' => '0', 'firebase_api_key' => '', 'firebase_auth_domain' => '', 'firebase_project_id' => '',
            'firebase_storage_bucket' => '', 'firebase_messaging_sender_id' => '', 'firebase_app_id' => '',
            'firebase_measurement_id' => '', 'firebase_vapid_key' => '', 'firebase_service_account' => '',
            'enquiry_shortcode' => '',
        ];
    }

    public static function settings(): array {
        $saved = get_option('hppwa_settings', []);
        return wp_parse_args(is_array($saved) ? $saved : [], self::defaults());
    }

    public static function update_settings(array $settings): void {
        update_option('hppwa_settings', wp_parse_args($settings, self::defaults()));
    }
}
