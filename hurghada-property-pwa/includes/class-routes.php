<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Routes {
    public function __construct(private HPPWA_Listings $listings) {}
    public function init(): void {
        add_action('init', [self::class, 'add_rules']);
        add_filter('query_vars', fn($vars) => array_merge($vars, ['hppwa_route']));
        add_action('template_redirect', [$this, 'render']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
        add_action('wp_head', [$this, 'head_meta']);
    }
    public static function add_rules(): void {
        add_rewrite_rule('^app/?$', 'index.php?hppwa_route=home', 'top');
        add_rewrite_rule('^app/(listings|developments|saved|contact)/?$', 'index.php?hppwa_route=$matches[1]', 'top');
    }
    public static function deactivate(): void { flush_rewrite_rules(); }
    public static function is_app(): bool { return (bool) get_query_var('hppwa_route'); }
    private function should_offer_install(): bool { return HPPWA_Plugin::settings()['enable_pwa'] === '1' && (self::is_app() || is_front_page() || is_home()); }
    public function assets(): void {
        if (!$this->should_offer_install()) { return; }
        $s = HPPWA_Plugin::settings();
        wp_enqueue_style('hppwa-app', HPPWA_URL . 'assets/css/app.css', [], HPPWA_VERSION);
        wp_enqueue_script('hppwa-install', HPPWA_URL . 'assets/js/install.js', [], HPPWA_VERSION, true);
        wp_localize_script('hppwa-install', 'HPPWAInstall', ['appName' => $s['app_name'], 'startUrl' => home_url('/app/'), 'serviceWorkerUrl' => home_url('/hurghada-pwa-sw.js'), 'showFallback' => is_front_page() || is_home()]);
        if (!self::is_app()) { return; }
        wp_enqueue_script('hppwa-app', HPPWA_URL . 'assets/js/app.js', ['hppwa-install'], HPPWA_VERSION, true);
        wp_localize_script('hppwa-app', 'HPPWA', ['ajaxUrl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('hppwa_ajax'), 'whatsapp' => preg_replace('/\D+/', '', $s['whatsapp']), 'template' => $s['whatsapp_template'], 'firebaseEnabled' => $s['enable_firebase'] === '1']);
        if ($s['enable_firebase'] === '1') { wp_enqueue_script('hppwa-firebase', HPPWA_URL . 'assets/js/firebase.js', ['hppwa-app'], HPPWA_VERSION, true); }
    }
    public function head_meta(): void {
        if (!$this->should_offer_install()) { return; }
        if (self::is_app()) { echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' . "\n"; }
        echo '<link rel="manifest" href="' . esc_url(home_url('/hurghada-pwa-manifest.json')) . '">' . "\n";
        echo '<meta name="theme-color" content="' . esc_attr(HPPWA_Plugin::settings()['theme_colour']) . '">' . "\n";
    }
    public function render(): void {
        $route = get_query_var('hppwa_route');
        if (!$route || in_array($route, ['manifest', 'sw'], true)) { return; }
        status_header(200); nocache_headers();
        $settings = HPPWA_Plugin::settings();
        $template = HPPWA_DIR . 'templates/app-' . ($route === 'home' ? 'home' : sanitize_file_name($route)) . '.php';
        if (!file_exists($template)) { $template = HPPWA_DIR . 'templates/app-home.php'; }
        ?><!doctype html><html <?php language_attributes(); ?>><head><?php wp_head(); ?></head><body <?php body_class('hppwa-app-route'); ?>><div class="hppwa-shell" style="--brand: <?php echo esc_attr($settings['brand_colour']); ?>"><?php include $template; $this->nav($route); ?></div><?php wp_footer(); ?></body></html><?php
        exit;
    }
    private function nav(string $active): void { $items = ['home'=>'Home','listings'=>'Listings','developments'=>'Developments','saved'=>'Saved','contact'=>'Contact']; echo '<nav class="hppwa-bottom-nav">'; foreach ($items as $key=>$label) { $url = $key === 'home' ? '/app/' : '/app/'.$key.'/'; echo '<a class="'.esc_attr($active===$key?'active':'').'" href="'.esc_url(home_url($url)).'">'.esc_html($label).'</a>'; } echo '</nav>'; }
}
