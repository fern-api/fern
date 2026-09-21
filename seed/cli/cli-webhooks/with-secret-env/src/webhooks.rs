//! Outbound emulation of the webhooks an API *sends*.
//!
//! OpenAPI `webhooks` (and Fern's `x-fern-webhook` operations) describe
//! requests the server makes to the user's own endpoint. They are not API
//! calls, so they are never lowered into ordinary CLI subcommands. Instead the
//! generator lowers the IR's `webhookGroups` into a [`WebhookManifest`] that
//! [`CliApp::webhooks`](crate::app::CliApp::webhooks) turns into two commands:
//!
//! ```text
//! <cli> webhook list
//! <cli> webhook invoke <NAME> <URL> [-d KEY=VALUE]... [--secret ...]
//! ```
//!
//! `invoke` builds the webhook's example payload (with `-d` overrides), signs
//! it exactly as the provider would according to the webhook's
//! `x-fern-webhook-signature` HMAC config, and delivers it to `URL` from the
//! developer's machine — so `http://localhost:3000/...` works with no tunnel.

use std::collections::BTreeMap;
use std::sync::Arc;

use base64::Engine;
use clap::{Arg, ArgAction, ArgMatches};
use hmac::{Hmac, Mac};
use serde::Deserialize;
use sha1::Sha1;
use sha2::{Digest, Sha256, Sha384, Sha512};

use crate::app::CliApp;
use crate::error::CliError;

/// The generator-emitted description of every webhook the API sends.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebhookManifest {
    /// Environment variable read for the signing secret when `--secret` is
    /// not passed.
    pub secret_env: String,
    pub webhooks: Vec<WebhookDescriptor>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebhookDescriptor {
    /// Command-line name, e.g. `sms-status`.
    pub name: String,
    #[serde(default)]
    pub display_name: Option<String>,
    #[serde(default)]
    pub docs: Option<String>,
    pub method: WebhookMethod,
    #[serde(default)]
    pub content_type: WebhookContentType,
    /// Payload the provider would send, used as the base for `-d` overrides.
    #[serde(default)]
    pub example_payload: serde_json::Value,
    /// Extra headers the provider sends, with example values when known.
    #[serde(default)]
    pub headers: Vec<WebhookHeader>,
    /// HMAC signing config. `None` means the webhook is unsigned (or uses an
    /// asymmetric scheme the CLI cannot emulate without the private key).
    #[serde(default)]
    pub signature: Option<HmacSignature>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebhookHeader {
    pub name: String,
    #[serde(default)]
    pub example: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum WebhookMethod {
    Get,
    Post,
}

impl WebhookMethod {
    fn as_str(self) -> &'static str {
        match self {
            WebhookMethod::Get => "GET",
            WebhookMethod::Post => "POST",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum WebhookContentType {
    #[default]
    Json,
    Form,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HmacSignature {
    pub header: String,
    pub algorithm: HashAlgorithm,
    pub encoding: SignatureEncoding,
    #[serde(default)]
    pub prefix: Option<String>,
    pub components: Vec<PayloadComponent>,
    #[serde(default)]
    pub delimiter: String,
    #[serde(default)]
    pub body_sort: Option<BodySort>,
    #[serde(default)]
    pub timestamp: Option<TimestampConfig>,
    #[serde(default)]
    pub body_hash: Option<BodyHashBinding>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum HashAlgorithm {
    Sha1,
    Sha256,
    Sha384,
    Sha512,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum SignatureEncoding {
    Base64,
    Hex,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum PayloadComponent {
    Body,
    Timestamp,
    NotificationUrl,
    MessageId,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum BodySort {
    Alphabetical,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimestampConfig {
    pub header: String,
    pub format: TimestampFormat,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TimestampFormat {
    UnixSeconds,
    UnixMillis,
    Iso8601,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyHashBinding {
    pub algorithm: HashAlgorithm,
    pub encoding: SignatureEncoding,
    pub query_parameter: String,
}

impl WebhookManifest {
    pub fn parse(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    fn find(&self, name: &str) -> Option<&WebhookDescriptor> {
        self.webhooks.iter().find(|w| w.name == name)
    }
}

impl CliApp {
    /// Register `webhook list` / `webhook invoke` from a generator-emitted
    /// manifest (see [`crate::webhooks`]).
    ///
    /// # Panics
    ///
    /// Panics if `manifest_json` is not a valid manifest. The manifest is
    /// baked into the binary at codegen time, so a parse failure is a build
    /// defect, not a runtime condition.
    pub fn webhooks(self, manifest_json: &str) -> Self {
        let manifest = WebhookManifest::parse(manifest_json)
            .expect("generated webhook manifest is valid JSON");
        self.webhooks_from(manifest)
    }

    pub fn webhooks_from(self, manifest: WebhookManifest) -> Self {
        let manifest = Arc::new(manifest);
        let list_manifest = Arc::clone(&manifest);
        let invoke_manifest = Arc::clone(&manifest);
        self.command_under(
            &["webhook"],
            list_command(),
            Box::new(move |_, _| {
                print_list(&list_manifest);
                Ok(())
            }),
        )
        .command_under(
            &["webhook"],
            invoke_command(&manifest),
            Box::new(move |matches, _| invoke(&invoke_manifest, matches)),
        )
    }
}

fn list_command() -> clap::Command {
    clap::Command::new("list").about("List the webhooks this API sends")
}

fn invoke_command(manifest: &WebhookManifest) -> clap::Command {
    let names: Vec<String> = manifest.webhooks.iter().map(|w| w.name.clone()).collect();
    let long_about = format!(
        "Emulate a webhook delivery: build the webhook's example payload (override \
         fields with -d), sign it the way the provider does, and send it to URL.\n\n\
         The request originates from this machine, so URL may point at localhost — \
         no tunnel required. The signing secret is read from --secret or ${}.\n\n\
         Available webhooks: {}",
        manifest.secret_env,
        names.join(", ")
    );
    clap::Command::new("invoke")
        .about("Send a signed test delivery of a webhook to a URL")
        .long_about(long_about)
        .arg(
            Arg::new("name")
                .required(true)
                .value_name("NAME")
                .value_parser(names)
                .help("Webhook to emulate (see `webhook list`)"),
        )
        .arg(
            Arg::new("url")
                .required(true)
                .value_name("URL")
                .help("Endpoint to deliver to, e.g. http://localhost:3000/hook"),
        )
        .arg(
            Arg::new("method")
                .short('X')
                .long("method")
                .value_name("METHOD")
                .value_parser(["GET", "POST"])
                .help("Override the HTTP method (defaults to the webhook's declared method)"),
        )
        .arg(
            Arg::new("data")
                .short('d')
                .long("data")
                .value_name("KEY=VALUE")
                .action(ArgAction::Append)
                .help("Set or override a payload field (repeatable)"),
        )
        .arg(
            Arg::new("body")
                .long("body")
                .value_name("JSON")
                .conflicts_with("data")
                .help("Replace the payload entirely with this JSON object (or @file)"),
        )
        .arg(
            Arg::new("form")
                .long("form")
                .action(ArgAction::SetTrue)
                .conflicts_with("json")
                .help("Send the payload as application/x-www-form-urlencoded"),
        )
        .arg(
            Arg::new("json")
                .long("json")
                .action(ArgAction::SetTrue)
                .help("Send the payload as application/json"),
        )
        .arg(
            Arg::new("header")
                .short('H')
                .long("header")
                .value_name("NAME: VALUE")
                .action(ArgAction::Append)
                .help("Add or override a request header (repeatable)"),
        )
        .arg(
            Arg::new("secret")
                .long("secret")
                .value_name("SECRET")
                .env(manifest.secret_env.clone())
                .hide_env_values(true)
                .help("Signing secret used to compute the signature header"),
        )
        .arg(
            Arg::new("no-signature")
                .long("no-signature")
                .action(ArgAction::SetTrue)
                .help("Send the request without a signature header"),
        )
        .arg(
            Arg::new("include")
                .short('i')
                .long("include")
                .action(ArgAction::SetTrue)
                .help("Print the response status and headers before the body"),
        )
}

fn print_list(manifest: &WebhookManifest) {
    if manifest.webhooks.is_empty() {
        println!("This API declares no webhooks.");
        return;
    }
    let width = manifest
        .webhooks
        .iter()
        .map(|w| w.name.len())
        .max()
        .unwrap_or(4)
        .max(4);
    println!(
        "{:<width$}  METHOD  SIGNED  DESCRIPTION",
        "NAME",
        width = width
    );
    for w in &manifest.webhooks {
        let signed = if w.signature.is_some() { "yes" } else { "no" };
        let description = w
            .display_name
            .as_deref()
            .or_else(|| w.docs.as_deref().and_then(|d| d.lines().next()))
            .unwrap_or("");
        println!(
            "{:<width$}  {:<6}  {:<6}  {}",
            w.name,
            w.method.as_str(),
            signed,
            description,
            width = width
        );
    }
}

/// A fully prepared delivery: what goes on the wire, and the URL it goes to.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreparedDelivery {
    pub method: WebhookMethod,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub body: Option<String>,
}

/// User-controlled inputs to [`prepare_delivery`].
pub struct DeliveryRequest<'a> {
    pub url: &'a str,
    pub method: WebhookMethod,
    pub content_type: WebhookContentType,
    pub payload: serde_json::Map<String, serde_json::Value>,
    pub extra_headers: Vec<(String, String)>,
    pub secret: Option<&'a str>,
    pub sign: bool,
    pub now_unix_millis: u128,
}

fn invoke(manifest: &WebhookManifest, matches: &ArgMatches) -> Result<(), CliError> {
    let name = matches.get_one::<String>("name").expect("required");
    let webhook = manifest
        .find(name)
        .ok_or_else(|| CliError::Validation(format!("unknown webhook {name:?}")))?;
    let url = matches.get_one::<String>("url").expect("required");

    let method = match matches.get_one::<String>("method").map(String::as_str) {
        Some("GET") => WebhookMethod::Get,
        Some("POST") => WebhookMethod::Post,
        _ => webhook.method,
    };
    let content_type = if matches.get_flag("form") {
        WebhookContentType::Form
    } else if matches.get_flag("json") {
        WebhookContentType::Json
    } else {
        webhook.content_type
    };

    let mut payload = match matches.get_one::<String>("body") {
        Some(body) => parse_body_arg(body)?,
        None => match &webhook.example_payload {
            serde_json::Value::Object(map) => map.clone(),
            _ => serde_json::Map::new(),
        },
    };
    for entry in matches.get_many::<String>("data").into_iter().flatten() {
        let (key, value) = entry.split_once('=').ok_or_else(|| {
            CliError::Validation(format!("invalid -d value {entry:?}; expected KEY=VALUE"))
        })?;
        let value = coerce_override(payload.get(key), value);
        payload.insert(key.to_string(), value);
    }

    let mut extra_headers: Vec<(String, String)> = webhook
        .headers
        .iter()
        .filter_map(|h| h.example.as_ref().map(|v| (h.name.clone(), v.clone())))
        .collect();
    for entry in matches.get_many::<String>("header").into_iter().flatten() {
        let (k, v) = entry.split_once(':').ok_or_else(|| {
            CliError::Validation(format!(
                "invalid -H value {entry:?}; expected 'Name: value'"
            ))
        })?;
        extra_headers.push((k.trim().to_string(), v.trim().to_string()));
    }

    let sign = !matches.get_flag("no-signature");
    let secret = matches.get_one::<String>("secret").map(String::as_str);
    if sign && webhook.signature.is_some() && secret.is_none() {
        return Err(CliError::Auth(format!(
            "no signing secret: pass --secret or set {}, or use --no-signature",
            manifest.secret_env
        )));
    }

    let now_unix_millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);

    let delivery = prepare_delivery(
        webhook,
        DeliveryRequest {
            url,
            method,
            content_type,
            payload,
            extra_headers,
            secret,
            sign,
            now_unix_millis,
        },
    )?;

    let response = tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(send(&delivery))
    })?;

    if matches.get_flag("include") {
        println!(
            "{} {}",
            response.status.as_u16(),
            response.status.canonical_reason().unwrap_or("")
        );
        for (k, v) in &response.headers {
            println!("{k}: {v}");
        }
        println!();
    }
    if !response.body.is_empty() {
        println!("{}", response.body);
    }
    if response.status.is_client_error() || response.status.is_server_error() {
        return Err(CliError::Other(anyhow::anyhow!(
            "webhook receiver responded with HTTP {}",
            response.status.as_u16()
        )));
    }
    Ok(())
}

/// A `-d KEY=VALUE` override keeps the type of the field it replaces: when
/// the example has a non-string value there and `value` parses as JSON of
/// the same kind, the parsed value is used; otherwise it stays a string.
fn coerce_override(existing: Option<&serde_json::Value>, value: &str) -> serde_json::Value {
    let Some(existing) = existing else {
        return serde_json::Value::String(value.to_string());
    };
    if existing.is_string() {
        return serde_json::Value::String(value.to_string());
    }
    match serde_json::from_str::<serde_json::Value>(value) {
        Ok(parsed)
            if std::mem::discriminant(&parsed) == std::mem::discriminant(existing)
                || (existing.is_null() && !parsed.is_string()) =>
        {
            parsed
        }
        _ => serde_json::Value::String(value.to_string()),
    }
}

fn parse_body_arg(body: &str) -> Result<serde_json::Map<String, serde_json::Value>, CliError> {
    let text = match body.strip_prefix('@') {
        Some(path) => std::fs::read_to_string(path)
            .map_err(|e| CliError::Validation(format!("cannot read --body file {path:?}: {e}")))?,
        None => body.to_string(),
    };
    match serde_json::from_str::<serde_json::Value>(&text) {
        Ok(serde_json::Value::Object(map)) => Ok(map),
        Ok(_) => Err(CliError::Validation("--body must be a JSON object".into())),
        Err(e) => Err(CliError::Validation(format!(
            "--body is not valid JSON: {e}"
        ))),
    }
}

/// Turn a payload field into the string a form/query parameter carries.
fn scalar_string(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Null => String::new(),
        other => other.to_string(),
    }
}

/// Flatten the payload into ordered `(key, value)` pairs, expanding arrays
/// into repeated keys the way form encoders do.
fn form_pairs(payload: &serde_json::Map<String, serde_json::Value>) -> Vec<(String, String)> {
    let mut pairs = Vec::new();
    for (k, v) in payload {
        match v {
            serde_json::Value::Array(items) => {
                for item in items {
                    pairs.push((k.clone(), scalar_string(item)));
                }
            }
            other => pairs.push((k.clone(), scalar_string(other))),
        }
    }
    pairs
}

fn form_encode(pairs: &[(String, String)]) -> String {
    let mut ser = form_urlencoded::Serializer::new(String::new());
    for (k, v) in pairs {
        ser.append_pair(k, v);
    }
    ser.finish()
}

/// Twilio-style body string: keys sorted, each key's values deduped and
/// sorted, `key + value` concatenated with no delimiter.
fn sorted_body_string(pairs: &[(String, String)]) -> String {
    let mut grouped: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for (k, v) in pairs {
        grouped.entry(k.as_str()).or_default().push(v.as_str());
    }
    let mut out = String::new();
    for (k, mut values) in grouped {
        values.sort_unstable();
        values.dedup();
        for v in values {
            out.push_str(k);
            out.push_str(v);
        }
    }
    out
}

fn append_query(url: &str, pairs: &[(String, String)]) -> String {
    if pairs.is_empty() {
        return url.to_string();
    }
    let query = form_encode(pairs);
    let (base, fragment) = match url.split_once('#') {
        Some((b, f)) => (b, Some(f)),
        None => (url, None),
    };
    let sep = if base.contains('?') {
        if base.ends_with('?') || base.ends_with('&') {
            ""
        } else {
            "&"
        }
    } else {
        "?"
    };
    let mut out = format!("{base}{sep}{query}");
    if let Some(f) = fragment {
        out.push('#');
        out.push_str(f);
    }
    out
}

fn digest(algorithm: HashAlgorithm, data: &[u8]) -> Vec<u8> {
    match algorithm {
        HashAlgorithm::Sha1 => Sha1::digest(data).to_vec(),
        HashAlgorithm::Sha256 => Sha256::digest(data).to_vec(),
        HashAlgorithm::Sha384 => Sha384::digest(data).to_vec(),
        HashAlgorithm::Sha512 => Sha512::digest(data).to_vec(),
    }
}

fn hmac_sign(algorithm: HashAlgorithm, key: &[u8], data: &[u8]) -> Vec<u8> {
    macro_rules! run {
        ($digest:ty) => {{
            let mut mac =
                <Hmac<$digest>>::new_from_slice(key).expect("HMAC accepts any key length");
            mac.update(data);
            mac.finalize().into_bytes().to_vec()
        }};
    }
    match algorithm {
        HashAlgorithm::Sha1 => run!(Sha1),
        HashAlgorithm::Sha256 => run!(Sha256),
        HashAlgorithm::Sha384 => run!(Sha384),
        HashAlgorithm::Sha512 => run!(Sha512),
    }
}

fn encode(encoding: SignatureEncoding, bytes: &[u8]) -> String {
    match encoding {
        SignatureEncoding::Base64 => base64::engine::general_purpose::STANDARD.encode(bytes),
        SignatureEncoding::Hex => bytes.iter().map(|b| format!("{b:02x}")).collect(),
    }
}

fn format_timestamp(format: TimestampFormat, now_unix_millis: u128) -> String {
    match format {
        TimestampFormat::UnixSeconds => (now_unix_millis / 1000).to_string(),
        TimestampFormat::UnixMillis => now_unix_millis.to_string(),
        TimestampFormat::Iso8601 => iso8601_utc(now_unix_millis / 1000),
    }
}

/// `YYYY-MM-DDTHH:MM:SSZ` from Unix seconds (Howard Hinnant's civil-date
/// algorithm), avoiding an optional `chrono` dependency.
fn iso8601_utc(unix_seconds: u128) -> String {
    let secs = unix_seconds as i64;
    let days = secs.div_euclid(86_400);
    let rem = secs.rem_euclid(86_400);
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    format!(
        "{y:04}-{m:02}-{d:02}T{:02}:{:02}:{:02}Z",
        rem / 3600,
        (rem % 3600) / 60,
        rem % 60
    )
}

/// Build the exact request a provider would send, including the signature.
///
/// Pure: no I/O, no clock — `now_unix_millis` is supplied by the caller so
/// the output is testable byte for byte.
pub fn prepare_delivery(
    webhook: &WebhookDescriptor,
    req: DeliveryRequest<'_>,
) -> Result<PreparedDelivery, CliError> {
    let pairs = form_pairs(&req.payload);

    let mut headers: Vec<(String, String)> = Vec::new();
    let mut url = req.url.to_string();
    let mut body: Option<String> = None;
    // The BODY signing component: raw wire body, or the sorted form string
    // when the scheme sorts POST parameters.
    let mut body_component = String::new();
    let mut body_hash_applied = false;

    match req.method {
        WebhookMethod::Get => {
            url = append_query(&url, &pairs);
        }
        WebhookMethod::Post => match req.content_type {
            WebhookContentType::Form => {
                let encoded = form_encode(&pairs);
                headers.push((
                    "Content-Type".into(),
                    "application/x-www-form-urlencoded".into(),
                ));
                let sorts_body = webhook
                    .signature
                    .as_ref()
                    .and_then(|s| s.body_sort)
                    .is_some();
                body_component = if sorts_body {
                    sorted_body_string(&pairs)
                } else {
                    encoded.clone()
                };
                body = Some(encoded);
            }
            WebhookContentType::Json => {
                let raw = serde_json::Value::Object(req.payload.clone()).to_string();
                headers.push(("Content-Type".into(), "application/json".into()));
                if let Some(binding) = webhook
                    .signature
                    .as_ref()
                    .and_then(|s| s.body_hash.as_ref())
                {
                    if req.sign {
                        let hash =
                            encode(binding.encoding, &digest(binding.algorithm, raw.as_bytes()));
                        url = append_query(&url, &[(binding.query_parameter.clone(), hash)]);
                        body_hash_applied = true;
                    }
                }
                body_component = raw.clone();
                body = Some(raw);
            }
        },
    }

    for (k, v) in &req.extra_headers {
        headers.push((k.clone(), v.clone()));
    }

    if req.sign {
        if let Some(sig) = &webhook.signature {
            let secret = req.secret.ok_or_else(|| {
                CliError::Auth("a signing secret is required to sign this webhook".into())
            })?;

            let timestamp = sig.timestamp.as_ref().map(|t| {
                (
                    t.header.clone(),
                    format_timestamp(t.format, req.now_unix_millis),
                )
            });
            if let Some((h, v)) = &timestamp {
                headers.push((h.clone(), v.clone()));
            }

            let mut parts: Vec<String> = Vec::new();
            for component in &sig.components {
                match component {
                    PayloadComponent::Body => {
                        // With a body-hash binding the body is bound through
                        // the hash in the URL and not signed directly.
                        if !body_hash_applied {
                            parts.push(body_component.clone());
                        }
                    }
                    PayloadComponent::NotificationUrl => parts.push(url.clone()),
                    PayloadComponent::Timestamp => match &timestamp {
                        Some((_, v)) => parts.push(v.clone()),
                        None => return Err(CliError::Validation(
                            "signature scheme signs a timestamp but declares no timestamp header"
                                .into(),
                        )),
                    },
                    PayloadComponent::MessageId => return Err(CliError::Validation(
                        "this webhook's signature covers a provider-assigned message id, which \
                             `webhook invoke` cannot emulate; re-run with --no-signature"
                            .into(),
                    )),
                }
            }
            let signed = parts.join(&sig.delimiter);
            let mac = hmac_sign(sig.algorithm, secret.as_bytes(), signed.as_bytes());
            let mut value = encode(sig.encoding, &mac);
            if let Some(prefix) = &sig.prefix {
                value.insert_str(0, prefix);
            }
            headers.push((sig.header.clone(), value));
        }
    }

    Ok(PreparedDelivery {
        method: req.method,
        url,
        headers,
        body,
    })
}

struct DeliveryResponse {
    status: reqwest::StatusCode,
    headers: Vec<(String, String)>,
    body: String,
}

async fn send(delivery: &PreparedDelivery) -> Result<DeliveryResponse, CliError> {
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| CliError::Other(anyhow::anyhow!("failed to build HTTP client: {e}")))?;
    let mut request = match delivery.method {
        WebhookMethod::Get => client.get(&delivery.url),
        WebhookMethod::Post => client.post(&delivery.url),
    };
    for (k, v) in &delivery.headers {
        request = request.header(k.as_str(), v.as_str());
    }
    if let Some(body) = &delivery.body {
        request = request.body(body.clone());
    }
    let response = request.send().await.map_err(|e| {
        CliError::Network(format!("webhook delivery to {} failed: {e}", delivery.url))
    })?;
    let status = response.status();
    let headers = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("<binary>").to_string()))
        .collect();
    let body = response
        .text()
        .await
        .map_err(|e| CliError::Network(format!("failed to read webhook response: {e}")))?;
    Ok(DeliveryResponse {
        status,
        headers,
        body,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn twilio_signature() -> HmacSignature {
        HmacSignature {
            header: "X-Twilio-Signature".into(),
            algorithm: HashAlgorithm::Sha1,
            encoding: SignatureEncoding::Base64,
            prefix: None,
            components: vec![PayloadComponent::NotificationUrl, PayloadComponent::Body],
            delimiter: String::new(),
            body_sort: Some(BodySort::Alphabetical),
            timestamp: None,
            body_hash: Some(BodyHashBinding {
                algorithm: HashAlgorithm::Sha256,
                encoding: SignatureEncoding::Hex,
                query_parameter: "bodySHA256".into(),
            }),
        }
    }

    fn webhook(
        content_type: WebhookContentType,
        signature: Option<HmacSignature>,
    ) -> WebhookDescriptor {
        WebhookDescriptor {
            name: "sms".into(),
            display_name: None,
            docs: None,
            method: WebhookMethod::Post,
            content_type,
            example_payload: serde_json::json!({}),
            headers: vec![],
            signature,
        }
    }

    fn header<'a>(d: &'a PreparedDelivery, name: &str) -> Option<&'a str> {
        d.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(name))
            .map(|(_, v)| v.as_str())
    }

    fn payload(pairs: &[(&str, &str)]) -> serde_json::Map<String, serde_json::Value> {
        pairs
            .iter()
            .map(|(k, v)| (k.to_string(), serde_json::Value::String(v.to_string())))
            .collect()
    }

    /// Reference vector from Twilio's "Validating signatures" docs.
    #[test]
    fn twilio_form_signature_matches_reference_vector() {
        let d = prepare_delivery(
            &webhook(WebhookContentType::Form, Some(twilio_signature())),
            DeliveryRequest {
                url: "https://mycompany.com/myapp.php?foo=1&bar=2",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Form,
                payload: payload(&[
                    ("CallSid", "CA1234567890ABCDE"),
                    ("Caller", "+14158675309"),
                    ("Digits", "1234"),
                    ("From", "+14158675309"),
                    ("To", "+18005551212"),
                ]),
                extra_headers: vec![],
                secret: Some("12345"),
                sign: true,
                now_unix_millis: 0,
            },
        )
        .unwrap();
        assert_eq!(
            header(&d, "X-Twilio-Signature"),
            Some("RSOYDt4T1cUTdK1PDd93/VVr8B8=")
        );
        assert_eq!(
            header(&d, "Content-Type"),
            Some("application/x-www-form-urlencoded")
        );
        assert_eq!(d.url, "https://mycompany.com/myapp.php?foo=1&bar=2");
        assert!(d
            .body
            .as_deref()
            .unwrap()
            .contains("CallSid=CA1234567890ABCDE"));
    }

    #[test]
    fn twilio_json_signature_binds_body_through_hash_and_signs_url_only() {
        let d = prepare_delivery(
            &webhook(WebhookContentType::Json, Some(twilio_signature())),
            DeliveryRequest {
                url: "https://example.com/hook",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Json,
                payload: payload(&[("MessageSid", "SM1")]),
                extra_headers: vec![],
                secret: Some("12345"),
                sign: true,
                now_unix_millis: 0,
            },
        )
        .unwrap();
        let raw = r#"{"MessageSid":"SM1"}"#;
        let hash = encode(
            SignatureEncoding::Hex,
            &digest(HashAlgorithm::Sha256, raw.as_bytes()),
        );
        assert_eq!(d.body.as_deref(), Some(raw));
        assert_eq!(d.url, format!("https://example.com/hook?bodySHA256={hash}"));
        let expected = encode(
            SignatureEncoding::Base64,
            &hmac_sign(HashAlgorithm::Sha1, b"12345", d.url.as_bytes()),
        );
        assert_eq!(header(&d, "X-Twilio-Signature"), Some(expected.as_str()));
    }

    #[test]
    fn get_moves_payload_to_query_and_signs_url() {
        let d = prepare_delivery(
            &webhook(WebhookContentType::Form, Some(twilio_signature())),
            DeliveryRequest {
                url: "http://localhost:3000/voice",
                method: WebhookMethod::Get,
                content_type: WebhookContentType::Form,
                payload: payload(&[("From", "+15551234567"), ("To", "+15557654321")]),
                extra_headers: vec![],
                secret: Some("s"),
                sign: true,
                now_unix_millis: 0,
            },
        )
        .unwrap();
        assert_eq!(
            d.url,
            "http://localhost:3000/voice?From=%2B15551234567&To=%2B15557654321"
        );
        assert_eq!(d.body, None);
        let expected = encode(
            SignatureEncoding::Base64,
            &hmac_sign(HashAlgorithm::Sha1, b"s", d.url.as_bytes()),
        );
        assert_eq!(header(&d, "X-Twilio-Signature"), Some(expected.as_str()));
    }

    #[test]
    fn github_style_prefixed_hex_sha256_over_raw_json() {
        let sig = HmacSignature {
            header: "X-Hub-Signature-256".into(),
            algorithm: HashAlgorithm::Sha256,
            encoding: SignatureEncoding::Hex,
            prefix: Some("sha256=".into()),
            components: vec![PayloadComponent::Body],
            delimiter: String::new(),
            body_sort: None,
            timestamp: None,
            body_hash: None,
        };
        let d = prepare_delivery(
            &webhook(WebhookContentType::Json, Some(sig)),
            DeliveryRequest {
                url: "http://localhost/hook",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Json,
                payload: payload(&[("action", "opened")]),
                extra_headers: vec![],
                secret: Some("It's a Secret to Everybody"),
                sign: true,
                now_unix_millis: 0,
            },
        )
        .unwrap();
        let expected = format!(
            "sha256={}",
            encode(
                SignatureEncoding::Hex,
                &hmac_sign(
                    HashAlgorithm::Sha256,
                    b"It's a Secret to Everybody",
                    br#"{"action":"opened"}"#
                )
            )
        );
        assert_eq!(header(&d, "X-Hub-Signature-256"), Some(expected.as_str()));
    }

    #[test]
    fn stripe_style_timestamp_dot_body() {
        let sig = HmacSignature {
            header: "Stripe-Signature".into(),
            algorithm: HashAlgorithm::Sha256,
            encoding: SignatureEncoding::Hex,
            prefix: None,
            components: vec![PayloadComponent::Timestamp, PayloadComponent::Body],
            delimiter: ".".into(),
            body_sort: None,
            timestamp: Some(TimestampConfig {
                header: "X-Timestamp".into(),
                format: TimestampFormat::UnixSeconds,
            }),
            body_hash: None,
        };
        let d = prepare_delivery(
            &webhook(WebhookContentType::Json, Some(sig)),
            DeliveryRequest {
                url: "http://localhost/hook",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Json,
                payload: payload(&[("id", "evt_1")]),
                extra_headers: vec![],
                secret: Some("whsec"),
                sign: true,
                now_unix_millis: 1_700_000_000_123,
            },
        )
        .unwrap();
        assert_eq!(header(&d, "X-Timestamp"), Some("1700000000"));
        let expected = encode(
            SignatureEncoding::Hex,
            &hmac_sign(
                HashAlgorithm::Sha256,
                b"whsec",
                br#"1700000000.{"id":"evt_1"}"#,
            ),
        );
        assert_eq!(header(&d, "Stripe-Signature"), Some(expected.as_str()));
    }

    #[test]
    fn data_override_keeps_existing_field_type() {
        let num = serde_json::json!(1);
        let flag = serde_json::json!(true);
        let text = serde_json::json!("x");
        assert_eq!(coerce_override(Some(&num), "42"), serde_json::json!(42));
        assert_eq!(
            coerce_override(Some(&flag), "false"),
            serde_json::json!(false)
        );
        assert_eq!(coerce_override(Some(&num), "abc"), serde_json::json!("abc"));
        assert_eq!(coerce_override(Some(&text), "42"), serde_json::json!("42"));
        assert_eq!(coerce_override(None, "42"), serde_json::json!("42"));
    }

    #[test]
    fn no_signature_sends_plain_request() {
        let d = prepare_delivery(
            &webhook(WebhookContentType::Json, Some(twilio_signature())),
            DeliveryRequest {
                url: "http://localhost/hook",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Json,
                payload: payload(&[("a", "b")]),
                extra_headers: vec![("X-Custom".into(), "1".into())],
                secret: None,
                sign: false,
                now_unix_millis: 0,
            },
        )
        .unwrap();
        assert_eq!(d.url, "http://localhost/hook");
        assert_eq!(header(&d, "X-Twilio-Signature"), None);
        assert_eq!(header(&d, "X-Custom"), Some("1"));
    }

    #[test]
    fn signing_without_secret_is_an_auth_error() {
        let err = prepare_delivery(
            &webhook(WebhookContentType::Json, Some(twilio_signature())),
            DeliveryRequest {
                url: "http://localhost/hook",
                method: WebhookMethod::Post,
                content_type: WebhookContentType::Json,
                payload: payload(&[]),
                extra_headers: vec![],
                secret: None,
                sign: true,
                now_unix_millis: 0,
            },
        )
        .unwrap_err();
        assert!(matches!(err, CliError::Auth(_)));
    }

    #[test]
    fn sorted_body_dedups_and_sorts_repeated_values() {
        let pairs = vec![
            ("b".to_string(), "2".to_string()),
            ("a".to_string(), "z".to_string()),
            ("a".to_string(), "x".to_string()),
            ("a".to_string(), "z".to_string()),
        ];
        assert_eq!(sorted_body_string(&pairs), "axazb2");
    }

    #[test]
    fn iso8601_formats_utc() {
        assert_eq!(iso8601_utc(0), "1970-01-01T00:00:00Z");
        assert_eq!(iso8601_utc(1_700_000_000), "2023-11-14T22:13:20Z");
    }

    #[test]
    fn manifest_parses_generator_shape() {
        let manifest = WebhookManifest::parse(
            r#"{
              "secretEnv": "TWILIO_AUTH_TOKEN",
              "webhooks": [{
                "name": "sms-status",
                "displayName": "SMS status callback",
                "method": "POST",
                "contentType": "form",
                "examplePayload": {"MessageSid": "SM1"},
                "headers": [{"name": "I-Twilio-Idempotency-Token", "example": "abc"}],
                "signature": {
                  "header": "X-Twilio-Signature",
                  "algorithm": "SHA1",
                  "encoding": "BASE64",
                  "components": ["NOTIFICATION_URL", "BODY"],
                  "delimiter": "",
                  "bodySort": "ALPHABETICAL",
                  "bodyHash": {"algorithm": "SHA256", "encoding": "HEX", "queryParameter": "bodySHA256"}
                }
              }]
            }"#,
        )
        .unwrap();
        let w = &manifest.webhooks[0];
        assert_eq!(w.content_type, WebhookContentType::Form);
        assert_eq!(
            w.signature.as_ref().unwrap().body_sort,
            Some(BodySort::Alphabetical)
        );
        assert_eq!(
            manifest.find("sms-status").map(|w| w.method),
            Some(WebhookMethod::Post)
        );
    }
}
