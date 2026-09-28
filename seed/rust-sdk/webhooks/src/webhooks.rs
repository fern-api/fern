//! Webhook signature verification helpers.
//!
//! Each helper exposes `verify_signature`, which never panics and never returns an
//! error: any missing or malformed input fails closed with `false`.

#[allow(unused_imports)]
use crate::core::webhook_signature::{self, WebhookDigest, WebhookEncoding, WebhookRequestBody};

/// Verifies HMAC webhook signatures.
///
/// Extract the signature from the `x-webhook-signature` header and pass it as `signature_header`.
/// Extract the timestamp from the `x-webhook-timestamp` header and pass it as `timestamp_header`.
#[derive(Debug, Clone, Copy, Default)]
pub struct WebhooksHelper;

impl WebhooksHelper {
    /// The HTTP header carrying the webhook signature.
    pub const SIGNATURE_HEADER: &'static str = "x-webhook-signature";
    /// Prefix stripped from the signature header value before comparison.
    pub const SIGNATURE_PREFIX: &'static str = "sha256=";
    /// The HTTP header carrying the webhook timestamp.
    pub const TIMESTAMP_HEADER: &'static str = "x-webhook-timestamp";
    /// Maximum accepted skew between the timestamp header and the current time.
    pub const TIMESTAMP_TOLERANCE_SECONDS: i64 = 300;

    /// Verify an HMAC webhook signature. Returns `false` on any mismatch or malformed input.
    pub fn verify_signature(
        request_body: &str,
        signature_header: &str,
        signature_key: &str,
        timestamp_header: &str,
    ) -> bool {
        if signature_header.is_empty() || signature_key.is_empty() {
            return false;
        }

        if timestamp_header.is_empty() {
            return false;
        }
        let timestamp_ms: i64 = match timestamp_header.parse::<i64>() {
            Ok(seconds) => seconds.saturating_mul(1000),
            Err(_) => return false,
        };
        let now_ms: i64 = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|elapsed| elapsed.as_millis() as i64)
            .unwrap_or(0);
        if (now_ms - timestamp_ms).abs() > Self::TIMESTAMP_TOLERANCE_SECONDS.saturating_mul(1000) {
            return false;
        }

        let signature = signature_header
            .strip_prefix(Self::SIGNATURE_PREFIX)
            .unwrap_or(signature_header);

        let body_string = request_body;

        let payload = format!("{}.{}", timestamp_header, body_string);
        let expected = webhook_signature::compute_hmac_signature(
            &payload,
            signature_key,
            WebhookDigest::Sha256,
            WebhookEncoding::Hex,
        );
        webhook_signature::timing_safe_equal(signature, &expected)
    }
}

/// Verifies HMAC webhook signatures.
///
/// Extract the signature from the `x-twilio-signature` header and pass it as `signature_header`.
/// `request_body` accepts either the raw body (`&str` / `String`) or parsed POST form
/// parameters (a map of key to value(s), or a slice of `(key, value)` pairs). For a form,
/// keys are sorted and each key's values are deduplicated and sorted, then concatenated as
/// key-value pairs before signing.
/// Both classic form-encoded and JSON requests are verified: the helper branches at runtime
/// on whether the body-hash query parameter is present on the notification URL. For a JSON
/// request the raw body is checked against that separately transmitted hash and the
/// signature is verified over the notification URL only. Pass the exact raw body as
/// `request_body` and the verbatim notification URL as `notification_url`.
/// The signature is verified against several normalized forms of the notification URL,
/// succeeding if any candidate matches.
#[derive(Debug, Clone, Copy, Default)]
pub struct SmsStatusWebhooksHelper;

impl SmsStatusWebhooksHelper {
    /// The HTTP header carrying the webhook signature.
    pub const SIGNATURE_HEADER: &'static str = "x-twilio-signature";

    /// Verify an HMAC webhook signature. Returns `false` on any mismatch or malformed input.
    pub fn verify_signature(
        request_body: impl Into<WebhookRequestBody>,
        signature_header: &str,
        signature_key: &str,
        notification_url: &str,
    ) -> bool {
        if signature_header.is_empty() || signature_key.is_empty() {
            return false;
        }

        let request_body: WebhookRequestBody = request_body.into();

        let transmitted_body_hash =
            webhook_signature::get_query_parameter(notification_url, "bodySHA256");
        if let Some(transmitted_body_hash) = &transmitted_body_hash {
            let Some(raw_body) = request_body.as_raw() else {
                return false;
            };
            let expected_body_hash = webhook_signature::compute_hash(
                raw_body,
                WebhookDigest::Sha256,
                WebhookEncoding::Hex,
            );
            if !webhook_signature::timing_safe_equal(&expected_body_hash, transmitted_body_hash) {
                return false;
            }
        }

        let body_string = request_body.to_signed_string();

        let candidates =
            webhook_signature::notification_url_candidates(notification_url, true, true);
        for candidate_url in &candidates {
            let payload = if transmitted_body_hash.is_some() {
                candidate_url.to_string()
            } else {
                format!("{}{}", candidate_url, body_string)
            };
            let expected = webhook_signature::compute_hmac_signature(
                &payload,
                signature_key,
                WebhookDigest::Sha1,
                WebhookEncoding::Base64,
            );
            if webhook_signature::timing_safe_equal(signature_header, &expected) {
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sms_status_webhooks_helper_body_hash_binding() {
        let request_body = r#"{"event":"example"}"#;
        let signature_key = "test-secret";
        let body_hash = webhook_signature::compute_hash(
            request_body,
            WebhookDigest::Sha256,
            WebhookEncoding::Hex,
        );
        let notification_url = format!(
            "https://example.com/webhook?z=last&bodySHA256={}&a=first%20value",
            body_hash
        );
        let tampered_url = "https://example.com/webhook?z=last&bodySHA256=tampered&a=first%20value";
        let sign = |url: &str, key: &str| {
            webhook_signature::compute_hmac_signature(
                url,
                key,
                WebhookDigest::Sha1,
                WebhookEncoding::Base64,
            )
        };
        let signature = sign(&notification_url, signature_key);

        assert!(SmsStatusWebhooksHelper::verify_signature(
            request_body,
            &signature,
            signature_key,
            &notification_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            format!("{} ", request_body),
            &signature,
            signature_key,
            &notification_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            request_body,
            &sign(tampered_url, signature_key),
            signature_key,
            tampered_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            request_body,
            "tampered-signature",
            signature_key,
            &notification_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            request_body,
            &signature,
            "wrong-secret",
            &notification_url
        ));
    }

    #[test]
    fn sms_status_webhooks_helper_form_body() {
        let signature_key = "test-secret";
        let notification_url = "https://example.com/webhook?a=1";
        let form: &[(&str, &str)] = &[
            ("To", "+15551234567"),
            ("Body", "z"),
            ("Body", "a"),
            ("Body", "z"),
        ];
        let body: WebhookRequestBody = form.into();
        assert_eq!(body.to_signed_string(), "BodyaBodyzTo+15551234567");
        let sign = |url: &str, key: &str| {
            webhook_signature::compute_hmac_signature(
                &format!("{}{}", url, body.to_signed_string()),
                key,
                WebhookDigest::Sha1,
                WebhookEncoding::Base64,
            )
        };
        let signature = sign(notification_url, signature_key);

        assert!(SmsStatusWebhooksHelper::verify_signature(
            form,
            &signature,
            signature_key,
            notification_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            &[("To", "+15551234567"), ("Body", "tampered")][..],
            &signature,
            signature_key,
            notification_url
        ));
        assert!(!SmsStatusWebhooksHelper::verify_signature(
            form,
            &signature,
            "wrong-secret",
            notification_url
        ));

        let signed_with_port = sign("https://example.com:443/webhook?a=1", signature_key);
        assert!(SmsStatusWebhooksHelper::verify_signature(
            form,
            &signed_with_port,
            signature_key,
            notification_url
        ));
    }
}
