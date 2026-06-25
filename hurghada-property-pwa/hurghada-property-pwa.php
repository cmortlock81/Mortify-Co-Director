<?php
/**
 * Plugin Name: Hurghada Property PWA
 * Description: Standalone mobile PWA app shell for Houzez property listings on hurghadaapartmentsales.com.
 * Version: 1.0.0
 * Author: Hurghada Apartment Sales
 * Text Domain: hurghada-property-pwa
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('HPPWA_VERSION', '1.0.0');
define('HPPWA_FILE', __FILE__);
define('HPPWA_DIR', plugin_dir_path(__FILE__));
define('HPPWA_URL', plugin_dir_url(__FILE__));
define('HPPWA_BASENAME', plugin_basename(__FILE__));

require_once HPPWA_DIR . 'includes/class-database.php';
require_once HPPWA_DIR . 'includes/class-listings.php';
require_once HPPWA_DIR . 'includes/class-pwa.php';
require_once HPPWA_DIR . 'includes/class-firebase.php';
require_once HPPWA_DIR . 'includes/class-routes.php';
require_once HPPWA_DIR . 'includes/class-admin.php';
require_once HPPWA_DIR . 'includes/class-plugin.php';

register_activation_hook(__FILE__, ['HPPWA_Database', 'activate']);
register_deactivation_hook(__FILE__, ['HPPWA_Routes', 'deactivate']);

add_action('plugins_loaded', static function (): void {
    HPPWA_Plugin::instance()->init();
});
