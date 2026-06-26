<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_Listings {
    public function post_type(): string {
        $settings = HPPWA_Plugin::settings();
        if (!empty($settings['property_post_type']) && post_type_exists($settings['property_post_type'])) { return $settings['property_post_type']; }
        foreach (['property', 'houzez_property'] as $type) { if (post_type_exists($type)) { return $type; } }
        return 'property';
    }
    public function taxonomies(): array {
        $taxes = get_object_taxonomies($this->post_type(), 'names');
        $candidates = ['property_city','property_area','property_label','property_type','property_status','property_feature','property_state','development','property_development','project'];
        return array_values(array_unique(array_intersect($candidates, $taxes ?: [])));
    }
    public function query(array $filters = []): WP_Query {
        $settings = HPPWA_Plugin::settings();
        $meta_query = [];
        if (!empty($filters['bedrooms'])) { $meta_query[] = ['key' => 'fave_property_bedrooms', 'value' => absint($filters['bedrooms']), 'compare' => '>=', 'type' => 'NUMERIC']; }
        if (!empty($filters['min_price'])) { $meta_query[] = ['key' => 'fave_property_price', 'value' => absint($filters['min_price']), 'compare' => '>=', 'type' => 'NUMERIC']; }
        if (!empty($filters['max_price'])) { $meta_query[] = ['key' => 'fave_property_price', 'value' => absint($filters['max_price']), 'compare' => '<=', 'type' => 'NUMERIC']; }
        $tax_query = [];
        if (!empty($filters['location'])) {
            foreach ($this->taxonomies() as $tax) {
                $term = get_term_by('slug', sanitize_title($filters['location']), $tax);
                if ($term) { $tax_query[] = ['taxonomy' => $tax, 'field' => 'term_id', 'terms' => [(int) $term->term_id]]; break; }
            }
        }
        $args = ['post_type' => $this->post_type(), 'post_status' => 'publish', 'posts_per_page' => absint($settings['listings_per_page']), 'meta_query' => $meta_query, 'tax_query' => $tax_query];
        if ($settings['default_sort'] === 'price_asc') { $args += ['meta_key' => 'fave_property_price', 'orderby' => 'meta_value_num', 'order' => 'ASC']; }
        elseif ($settings['default_sort'] === 'price_desc') { $args += ['meta_key' => 'fave_property_price', 'orderby' => 'meta_value_num', 'order' => 'DESC']; }
        else { $args += ['orderby' => 'date', 'order' => 'DESC']; }
        return new WP_Query($args);
    }
    public function property_data(int $post_id): array {
        $terms = [];
        foreach ($this->taxonomies() as $tax) { $names = wp_get_post_terms($post_id, $tax, ['fields' => 'names']); if (!is_wp_error($names)) { $terms = array_merge($terms, $names); } }
        $price = get_post_meta($post_id, 'fave_property_price', true) ?: get_post_meta($post_id, 'property_price', true);
        return [
            'id' => $post_id, 'title' => get_the_title($post_id), 'url' => get_permalink($post_id),
            'image' => get_the_post_thumbnail_url($post_id, 'large') ?: HPPWA_URL . 'assets/icons/icon.svg',
            'price' => $price, 'bedrooms' => get_post_meta($post_id, 'fave_property_bedrooms', true),
            'bathrooms' => get_post_meta($post_id, 'fave_property_bathrooms', true), 'area' => get_post_meta($post_id, 'fave_property_size', true),
            'location' => implode(', ', array_slice(array_unique($terms), 0, 3)), 'status' => implode(', ', wp_get_post_terms($post_id, 'property_status', ['fields' => 'names']) ?: []),
        ];
    }
    public function developments(): array {
        $tiles = [];
        foreach ($this->taxonomies() as $tax) {
            $terms = get_terms(['taxonomy' => $tax, 'hide_empty' => true, 'number' => 24]);
            if (!is_wp_error($terms)) { foreach ($terms as $term) { $tiles[$term->slug] = ['name' => $term->name, 'count' => $term->count, 'slug' => $term->slug, 'taxonomy' => $tax]; } }
        }
        return array_values($tiles);
    }
}
