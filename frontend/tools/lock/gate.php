<?php
// Password lock for products awaiting approval on hosts without Vercel (stada.kz on PS.kz).
//
// tools/export-country.cjs moves each locked page to __lock/pages/... (a PHP file that refuses to run
// on its own) and leaves a redirect to this gate at the page's address. The gate sends the page only
// with a valid session cookie, set after the right password.
//
// The password is never in the export: __lock/config.php is created once on the server (see
// frontend/README.md, "Locked products") and is not overwritten by later uploads:
//   <?php return ['password_hash' => '<password_hash() of the password>', 'secret' => '<long random string>'];

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

$pages = /*PAGES*/[]/*END*/;
$gate = /*GATE*/''/*END*/;
$gateWrong = /*GATE_WRONG*/''/*END*/;

$config = is_file(__DIR__ . '/config.php') ? include __DIR__ . '/config.php' : null;
if (!is_array($config) || empty($config['password_hash']) || empty($config['secret'])) {
    http_response_code(503);
    exit('Not configured.');
}

$page = isset($_REQUEST['p']) ? (string) $_REQUEST['p'] : '';
if (!isset($pages[$page])) {
    http_response_code(404);
    exit('Not found.');
}

$cookieName = 'stada_lock';
$secret = (string) $config['secret'];
$days = isset($config['session_days']) ? (int) $config['session_days'] : 14;
$self = '/__lock/index.php?p=' . rawurlencode($page);

function lock_valid($token, $secret) {
    $parts = explode('.', (string) $token);
    if (count($parts) !== 2 || !ctype_digit($parts[0]) || (int) $parts[0] < time()) return false;
    return hash_equals(hash_hmac('sha256', 'lock|' . $parts[0], $secret), $parts[1]);
}

function lock_gate($html, $self) {
    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    echo str_replace('__ACTION__', htmlspecialchars($self, ENT_QUOTES, 'UTF-8'), $html);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $entered = isset($_POST['password']) ? (string) $_POST['password'] : '';
    if (!password_verify($entered, (string) $config['password_hash'])) {
        // A short pause on every wrong entry slows down guessing.
        usleep(700000);
        lock_gate($gateWrong, $self);
    }
    $expires = time() + $days * 86400;
    $token = $expires . '.' . hash_hmac('sha256', 'lock|' . $expires, $secret);
    header('Set-Cookie: ' . $cookieName . '=' . $token . '; Path=/; Max-Age=' . ($days * 86400) . '; HttpOnly; Secure; SameSite=Lax');
    header('Location: ' . $self, true, 303);
    exit;
}

if (!lock_valid(isset($_COOKIE[$cookieName]) ? $_COOKIE[$cookieName] : '', $secret)) lock_gate($gate, $self);

$file = __DIR__ . '/pages/' . $pages[$page];
$html = is_file($file) ? file_get_contents($file) : false;
if ($html === false) {
    http_response_code(404);
    exit('Not found.');
}
header('Content-Type: text/html; charset=utf-8');
// The stored page starts with a line that stops it running on its own. The address bar is set back to
// the page's own address before the site's scripts run (reloading it comes back here via the redirect).
$html = substr($html, strpos($html, "\n") + 1);
$restore = '<script>history.replaceState(null, "", ' . json_encode('/' . $page) . ' + location.hash);</script>';
echo preg_replace('/<head>/i', '<head>' . $restore, $html, 1);
