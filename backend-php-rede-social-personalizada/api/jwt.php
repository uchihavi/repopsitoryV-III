<?php
// api/jwt.php
$JWT_SECRET = getenv('JWT_SECRET') ?: 'change-this-secret';
$JWT_ISS = getenv('JWT_ISS') ?: 'rede-social-personalizada';
$JWT_EXP_SECONDS = 60 * 60 * 24 * 7; // 7 days

function b64url($data){ return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }

function jwt_sign($payload){
  global $JWT_SECRET, $JWT_ISS, $JWT_EXP_SECONDS;
  $header = [ "alg"=>"HS256", "typ"=>"JWT" ];
  $now = time();
  $payload['iss'] = $JWT_ISS;
  $payload['iat'] = $now;
  $payload['exp'] = $now + $JWT_EXP_SECONDS;

  $seg1 = b64url(json_encode($header));
  $seg2 = b64url(json_encode($payload));
  $sig = hash_hmac('sha256', "$seg1.$seg2", $JWT_SECRET, true);
  $seg3 = b64url($sig);
  return "$seg1.$seg2.$seg3";
}

function jwt_verify($jwt){
  global $JWT_SECRET;
  $parts = explode('.', $jwt);
  if(count($parts)!==3) return false;
  list($h,$p,$s) = $parts;
  $sig = b64url(hash_hmac('sha256', "$h.$p", $JWT_SECRET, true));
  if(!hash_equals($sig, $s)) return false;
  $payload = json_decode(base64_decode(strtr($p, '-_', '+/')), true);
  if(!$payload) return false;
  if(isset($payload['exp']) && time() > $payload['exp']) return false;
  return $payload;
}
?>