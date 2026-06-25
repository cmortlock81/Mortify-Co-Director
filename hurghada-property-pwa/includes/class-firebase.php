<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Firebase {
    public function init(): void {
        add_action('wp_ajax_hppwa_register_token', [$this, 'register_token']);
        add_action('wp_ajax_nopriv_hppwa_register_token', [$this, 'register_token']);
        add_action('wp_ajax_hppwa_send_notification', [$this, 'send_notification']);
    }
    public function register_token(): void {
        check_ajax_referer('hppwa_ajax', 'nonce');
        $token = sanitize_textarea_field(wp_unslash($_POST['token'] ?? ''));
        if ($token === '') { wp_send_json_error(['message' => 'Missing token'], 400); }
        global $wpdb; $now = current_time('mysql'); $hash = hash('sha256', $token);
        $wpdb->query($wpdb->prepare('INSERT INTO ' . HPPWA_Database::table() . ' (token, token_hash, user_agent, endpoint_source, created_at, last_seen) VALUES (%s,%s,%s,%s,%s,%s) ON DUPLICATE KEY UPDATE user_agent=VALUES(user_agent), last_seen=VALUES(last_seen)', $token, $hash, sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'] ?? '')), 'firebase', $now, $now));
        wp_send_json_success();
    }
    public function send_notification(): void {
        if (!current_user_can('manage_options')) { wp_send_json_error(['message' => 'Forbidden'], 403); }
        check_ajax_referer('hppwa_admin', 'nonce');
        $result = $this->broadcast(sanitize_text_field(wp_unslash($_POST['title'] ?? 'Hurghada Property PWA')), sanitize_textarea_field(wp_unslash($_POST['body'] ?? 'Test notification')));
        wp_send_json_success($result);
    }
    public function broadcast(string $title, string $body): array {
        $settings = HPPWA_Plugin::settings();
        if (empty($settings['firebase_service_account'])) { return ['sent' => 0, 'message' => 'Firebase HTTP v1 service account JSON is not configured.']; }
        return ['sent' => 0, 'message' => 'Service account sending scaffold is ready; add OAuth token exchange for production credentials.'];
    }
}
