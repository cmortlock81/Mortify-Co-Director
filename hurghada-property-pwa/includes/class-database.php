<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Database {
    public static function table(): string { global $wpdb; return $wpdb->prefix . 'hurghada_pwa_tokens'; }
    public static function activate(): void {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset = $wpdb->get_charset_collate();
        $table = self::table();
        dbDelta("CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            token text NOT NULL,
            token_hash varchar(64) NOT NULL,
            user_agent text NULL,
            endpoint_source varchar(100) DEFAULT 'web',
            created_at datetime NOT NULL,
            last_seen datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY token_hash (token_hash)
        ) $charset;");
        if (class_exists('HPPWA_Routes')) { HPPWA_Routes::add_rules(); flush_rewrite_rules(); }
    }
    public static function count_tokens(): int { global $wpdb; return (int) $wpdb->get_var("SELECT COUNT(*) FROM " . self::table()); }
}
