<?php
if (!defined('ABSPATH')) { exit; }

final class HPPWA_PWA {
    public function init(): void {
        add_action('init', [$this, 'rules']);
        add_action('template_redirect', [$this, 'serve']);
    }
    public function rules(): void {
        add_rewrite_rule('^hurghada-pwa-manifest\.json$', 'index.php?hppwa_route=manifest', 'top');
        add_rewrite_rule('^manifest\.json$', 'index.php?hppwa_route=manifest', 'top');
        add_rewrite_rule('^hurghada-pwa-sw\.js$', 'index.php?hppwa_route=sw', 'top');
        add_rewrite_rule('^sw\.js$', 'index.php?hppwa_route=sw', 'top');
    }
    public function serve(): void {
        $route = get_query_var('hppwa_route');
        if ($route === 'manifest') { $this->manifest(); exit; }
        if ($route === 'sw') { $this->service_worker(); exit; }
    }
    private function manifest(): void {
        $s = HPPWA_Plugin::settings(); header('Content-Type: application/manifest+json; charset=utf-8');
        echo wp_json_encode(['name'=>$s['app_name'],'short_name'=>$s['short_name'],'start_url'=>home_url('/app/'),'scope'=>home_url('/'),'display'=>'standalone','theme_color'=>$s['theme_colour'],'background_color'=>$s['background_colour'],'icons'=>[['src'=>HPPWA_URL.'assets/icons/icon.svg','sizes'=>'any','type'=>'image/svg+xml','purpose'=>'any'],['src'=>HPPWA_URL.'assets/icons/maskable.svg','sizes'=>'any','type'=>'image/svg+xml','purpose'=>'maskable']]], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }
    private function service_worker(): void {
        $s = HPPWA_Plugin::settings(); header('Content-Type: application/javascript; charset=utf-8');
        $cache = 'hurghada-pwa-' . preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $s['cache_version']);
        $assets = [home_url('/app/'), home_url('/app/listings/'), home_url('/app/contact/'), HPPWA_URL.'assets/css/app.css', HPPWA_URL.'assets/js/app.js', HPPWA_URL.'assets/icons/icon.svg', HPPWA_URL.'assets/icons/maskable.svg', HPPWA_URL.'templates/offline.php'];
        ?>
const CACHE_NAME = <?php echo wp_json_encode($cache); ?>;
const APP_ASSETS = <?php echo wp_json_encode($assets, JSON_UNESCAPED_SLASHES); ?>;
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('hurghada-pwa-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => { const url = new URL(event.request.url); if (!url.pathname.startsWith('/app/') && !url.pathname.includes('hurghada-property-pwa')) return; event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(cached => cached || caches.match(<?php echo wp_json_encode(home_url('/app/')); ?>)))); });
self.addEventListener('push', event => { const data = event.data ? event.data.json() : {}; event.waitUntil(self.registration.showNotification(data.title || 'Hurghada Property PWA', { body: data.body || '', icon: <?php echo wp_json_encode(HPPWA_URL.'assets/icons/icon.svg'); ?>, data: data.url || <?php echo wp_json_encode(home_url('/app/')); ?> })); });
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data || '/app/')); });
<?php }
}
