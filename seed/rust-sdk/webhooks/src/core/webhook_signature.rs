//! Primitives for verifying webhook signatures: keyed HMACs, unkeyed body digests,
//! constant-time comparison, and notification-URL normalization.

use hmac::Mac;
use std::collections::BTreeMap;
use std::fmt;

/// A digest algorithm used either for HMAC signing or for hashing a raw request body.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WebhookDigest {
    Sha1,
    Sha256,
    Sha384,
    Sha512,
}

/// How a digest or signature is encoded on the wire.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WebhookEncoding {
    Base64,
    Hex,
}

/// The request body handed to a webhook signature helper.
///
/// Providers that sign form-encoded parameters (e.g. Twilio) sign a canonical string
/// built from the parsed form rather than the raw bytes, so the helper accepts either.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WebhookRequestBody {
    /// The exact raw request body.
    Raw(String),
    /// Parsed POST form parameters; each key may carry several values.
    Form(BTreeMap<String, Vec<String>>),
}

impl WebhookRequestBody {
    /// Flatten the body into the string that is signed. Mirrors Twilio's
    /// `toFormUrlEncodedParam`: keys are sorted, each key's values are deduplicated and
    /// sorted, and `key + value` is concatenated for every value with no delimiter. A raw
    /// body is returned unchanged.
    pub fn to_signed_string(&self) -> String {
        match self {
            WebhookRequestBody::Raw(raw) => raw.clone(),
            WebhookRequestBody::Form(form) => {
                let mut out = String::new();
                for (key, values) in form {
                    let mut values = values.clone();
                    values.sort();
                    values.dedup();
                    for value in values {
                        out.push_str(key);
                        out.push_str(&value);
                    }
                }
                out
            }
        }
    }

    /// The raw body, when this is not a parsed form.
    pub fn as_raw(&self) -> Option<&str> {
        match self {
            WebhookRequestBody::Raw(raw) => Some(raw.as_str()),
            WebhookRequestBody::Form(_) => None,
        }
    }
}

impl From<&str> for WebhookRequestBody {
    fn from(value: &str) -> Self {
        WebhookRequestBody::Raw(value.to_string())
    }
}

impl From<String> for WebhookRequestBody {
    fn from(value: String) -> Self {
        WebhookRequestBody::Raw(value)
    }
}

impl From<&String> for WebhookRequestBody {
    fn from(value: &String) -> Self {
        WebhookRequestBody::Raw(value.clone())
    }
}

impl From<BTreeMap<String, Vec<String>>> for WebhookRequestBody {
    fn from(value: BTreeMap<String, Vec<String>>) -> Self {
        WebhookRequestBody::Form(value)
    }
}

impl From<std::collections::HashMap<String, Vec<String>>> for WebhookRequestBody {
    fn from(value: std::collections::HashMap<String, Vec<String>>) -> Self {
        WebhookRequestBody::Form(value.into_iter().collect())
    }
}

impl From<BTreeMap<String, String>> for WebhookRequestBody {
    fn from(value: BTreeMap<String, String>) -> Self {
        WebhookRequestBody::Form(value.into_iter().map(|(k, v)| (k, vec![v])).collect())
    }
}

impl From<std::collections::HashMap<String, String>> for WebhookRequestBody {
    fn from(value: std::collections::HashMap<String, String>) -> Self {
        WebhookRequestBody::Form(value.into_iter().map(|(k, v)| (k, vec![v])).collect())
    }
}

impl<'a> From<&'a [(&'a str, &'a str)]> for WebhookRequestBody {
    fn from(pairs: &'a [(&'a str, &'a str)]) -> Self {
        let mut form: BTreeMap<String, Vec<String>> = BTreeMap::new();
        for (key, value) in pairs {
            form.entry((*key).to_string())
                .or_default()
                .push((*value).to_string());
        }
        WebhookRequestBody::Form(form)
    }
}

impl fmt::Display for WebhookRequestBody {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.to_signed_string())
    }
}

fn encode(bytes: &[u8], encoding: WebhookEncoding) -> String {
    match encoding {
        WebhookEncoding::Hex => bytes.iter().map(|b| format!("{:02x}", b)).collect(),
        WebhookEncoding::Base64 => {
            const TABLE: &[u8; 64] =
                b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
            for chunk in bytes.chunks(3) {
                let b = [
                    chunk[0],
                    *chunk.get(1).unwrap_or(&0),
                    *chunk.get(2).unwrap_or(&0),
                ];
                let n = (u32::from(b[0]) << 16) | (u32::from(b[1]) << 8) | u32::from(b[2]);
                out.push(TABLE[((n >> 18) & 63) as usize] as char);
                out.push(TABLE[((n >> 12) & 63) as usize] as char);
                out.push(if chunk.len() > 1 {
                    TABLE[((n >> 6) & 63) as usize] as char
                } else {
                    '='
                });
                out.push(if chunk.len() > 2 {
                    TABLE[(n & 63) as usize] as char
                } else {
                    '='
                });
            }
            out
        }
    }
}

/// Compute the HMAC of `payload` keyed with `secret`, encoded per `encoding`.
pub fn compute_hmac_signature(
    payload: &str,
    secret: &str,
    digest: WebhookDigest,
    encoding: WebhookEncoding,
) -> String {
    fn mac<D: hmac::digest::Digest + hmac::digest::core_api::BlockSizeUser + Clone>(
        payload: &str,
        secret: &str,
    ) -> Vec<u8> {
        let mut m = hmac::SimpleHmac::<D>::new_from_slice(secret.as_bytes())
            .expect("HMAC accepts keys of any length");
        m.update(payload.as_bytes());
        m.finalize().into_bytes().to_vec()
    }
    let bytes = match digest {
        WebhookDigest::Sha1 => mac::<sha1::Sha1>(payload, secret),
        WebhookDigest::Sha256 => mac::<sha2::Sha256>(payload, secret),
        WebhookDigest::Sha384 => mac::<sha2::Sha384>(payload, secret),
        WebhookDigest::Sha512 => mac::<sha2::Sha512>(payload, secret),
    };
    encode(&bytes, encoding)
}

/// Compute an unkeyed digest of `payload`, encoded per `encoding`.
pub fn compute_hash(payload: &str, digest: WebhookDigest, encoding: WebhookEncoding) -> String {
    use hmac::digest::Digest;
    let bytes = match digest {
        WebhookDigest::Sha1 => sha1::Sha1::digest(payload.as_bytes()).to_vec(),
        WebhookDigest::Sha256 => sha2::Sha256::digest(payload.as_bytes()).to_vec(),
        WebhookDigest::Sha384 => sha2::Sha384::digest(payload.as_bytes()).to_vec(),
        WebhookDigest::Sha512 => sha2::Sha512::digest(payload.as_bytes()).to_vec(),
    };
    encode(&bytes, encoding)
}

/// Compare two strings without leaking their contents through timing.
pub fn timing_safe_equal(known: &str, given: &str) -> bool {
    let known = known.as_bytes();
    let given = given.as_bytes();
    if known.len() != given.len() {
        return false;
    }
    let mut diff: u8 = 0;
    for (a, b) in known.iter().zip(given) {
        diff |= a ^ b;
    }
    diff == 0
}

/// Read a query parameter from a URL without modifying it. Returns `None` when the URL
/// cannot be parsed or the parameter is absent.
pub fn get_query_parameter(url: &str, name: &str) -> Option<String> {
    let parsed = url::Url::parse(url).ok()?;
    parsed
        .query_pairs()
        .find(|(key, _)| key == name)
        .map(|(_, value)| value.into_owned())
}

/// Return the explicit port from the raw URL string, if any. `url::Url` fills in the
/// scheme default, so the raw authority has to be inspected instead.
fn explicit_port(url: &str) -> Option<&str> {
    let rest = url.split_once("://")?.1;
    let authority = rest.split(['/', '?', '#']).next()?;
    let host_and_port = authority.rsplit('@').next()?;
    let (_, port) = host_and_port.rsplit_once(':')?;
    if !port.is_empty() && port.bytes().all(|b| b.is_ascii_digit()) {
        Some(port)
    } else {
        None
    }
}

/// Reassemble a URL from its parsed components, substituting the given port (or omitting
/// it for `None`). Emitted component by component so the result is byte-comparable to
/// what the provider signed.
fn reassemble_url(parsed: &url::Url, port: Option<&str>) -> String {
    let mut out = String::new();
    out.push_str(parsed.scheme());
    out.push_str("://");
    if !parsed.username().is_empty() {
        out.push_str(parsed.username());
        if let Some(password) = parsed.password() {
            out.push(':');
            out.push_str(password);
        }
        out.push('@');
    }
    if let Some(host) = parsed.host_str() {
        out.push_str(host);
    }
    if let Some(port) = port {
        out.push(':');
        out.push_str(port);
    }
    out.push_str(parsed.path());
    if let Some(query) = parsed.query() {
        out.push('?');
        out.push_str(query);
    }
    if let Some(fragment) = parsed.fragment() {
        out.push('#');
        out.push_str(fragment);
    }
    out
}

fn standard_port(scheme: &str) -> Option<&'static str> {
    match scheme.to_ascii_lowercase().as_str() {
        "https" => Some("443"),
        "http" => Some("80"),
        _ => None,
    }
}

/// Re-encode the query with legacy form-encoding (`+` for spaces, `%XX` for reserved
/// characters). Only the query component is rewritten so the scheme, authority, and any
/// explicit port are preserved byte-for-byte.
fn with_legacy_querystring(url: &str) -> String {
    let Ok(parsed) = url::Url::parse(url) else {
        return url.to_string();
    };
    let Some(query) = parsed.query().filter(|q| !q.is_empty()) else {
        return url.to_string();
    };
    let requoted = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs(url::form_urlencoded::parse(query.as_bytes()))
        .finish();
    let Some((prefix, rest)) = url.split_once('?') else {
        return url.to_string();
    };
    let fragment = rest
        .split_once('#')
        .map(|(_, f)| format!("#{}", f))
        .unwrap_or_default();
    format!("{}?{}{}", prefix, requoted, fragment)
}

/// Build the list of normalized notification-URL forms to verify a webhook signature
/// against. Some providers (e.g. Twilio) are inconsistent about whether the URL they
/// signed carried a port and how its query string was encoded, so a signature is
/// accepted if it matches the computation over ANY of these candidates.
///
/// Always includes at least the caller-supplied URL; an unparseable URL yields `[url]`.
pub fn notification_url_candidates(
    url: &str,
    port_variants: bool,
    legacy_query_encoding: bool,
) -> Vec<String> {
    let Ok(parsed) = url::Url::parse(url) else {
        return vec![url.to_string()];
    };

    let port_forms: Vec<String> = if port_variants {
        let with_port = match explicit_port(url) {
            Some(port) => reassemble_url(&parsed, Some(port)),
            None => reassemble_url(&parsed, standard_port(parsed.scheme())),
        };
        vec![reassemble_url(&parsed, None), with_port]
    } else {
        vec![url.to_string()]
    };

    let mut candidates: Vec<String> = vec![url.to_string()];
    let mut push = |candidate: String| {
        if !candidates.contains(&candidate) {
            candidates.push(candidate);
        }
    };
    for form in &port_forms {
        push(form.clone());
    }
    if legacy_query_encoding {
        for form in &port_forms {
            push(with_legacy_querystring(form));
        }
    }
    candidates
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hmac_sha256_hex_matches_reference_vector() {
        // RFC 4231 test case 2.
        let sig = compute_hmac_signature(
            "what do ya want for nothing?",
            "Jefe",
            WebhookDigest::Sha256,
            WebhookEncoding::Hex,
        );
        assert_eq!(
            sig,
            "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
        );
    }

    #[test]
    fn hmac_sha1_base64_matches_twilio_reference_vector() {
        // From twilio-node's request validator tests.
        let url = "https://mycompany.com/myapp.php?foo=1&bar=2";
        let body: WebhookRequestBody = [
            ("CallSid", "CA1234567890ABCDE"),
            ("Caller", "+14158675309"),
            ("Digits", "1234"),
            ("From", "+14158675309"),
            ("To", "+18005551212"),
        ]
        .as_slice()
        .into();
        let payload = format!("{}{}", url, body.to_signed_string());
        let sig = compute_hmac_signature(
            &payload,
            "12345",
            WebhookDigest::Sha1,
            WebhookEncoding::Base64,
        );
        assert_eq!(sig, "RSOYDt4T1cUTdK1PDd93/VVr8B8=");
    }

    #[test]
    fn form_body_sorts_and_dedupes_multi_values() {
        let body: WebhookRequestBody = [("b", "2"), ("a", "z"), ("a", "x"), ("a", "z")]
            .as_slice()
            .into();
        assert_eq!(body.to_signed_string(), "axazb2");
    }

    #[test]
    fn body_hash_sha256_hex() {
        assert_eq!(
            compute_hash("abc", WebhookDigest::Sha256, WebhookEncoding::Hex),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn timing_safe_equal_rejects_length_and_content_mismatch() {
        assert!(timing_safe_equal("abc", "abc"));
        assert!(!timing_safe_equal("abc", "abd"));
        assert!(!timing_safe_equal("abc", "abcd"));
    }

    #[test]
    fn query_parameter_lookup() {
        assert_eq!(
            get_query_parameter("https://x.test/h?a=1&bodySHA256=abc%20d", "bodySHA256"),
            Some("abc d".to_string())
        );
        assert_eq!(
            get_query_parameter("https://x.test/h?a=1", "bodySHA256"),
            None
        );
        assert_eq!(get_query_parameter("not a url", "a"), None);
    }

    #[test]
    fn url_candidates_add_and_remove_ports_and_legacy_encoding() {
        let candidates =
            notification_url_candidates("https://mycompany.com/myapp.php?foo=1&bar=2", true, true);
        assert_eq!(
            candidates,
            vec![
                "https://mycompany.com/myapp.php?foo=1&bar=2".to_string(),
                "https://mycompany.com:443/myapp.php?foo=1&bar=2".to_string(),
            ]
        );

        let candidates = notification_url_candidates(
            "https://mycompany.com:1234/myapp.php?foo=a%20b",
            true,
            true,
        );
        assert_eq!(
            candidates,
            vec![
                "https://mycompany.com:1234/myapp.php?foo=a%20b".to_string(),
                "https://mycompany.com/myapp.php?foo=a%20b".to_string(),
                "https://mycompany.com/myapp.php?foo=a+b".to_string(),
                "https://mycompany.com:1234/myapp.php?foo=a+b".to_string(),
            ]
        );

        assert_eq!(
            notification_url_candidates("not a url", true, true),
            vec!["not a url".to_string()]
        );
    }
}
