//! `profiles create --provision`: mint a remote credential for a profile.
//!
//! The generator names an operation (an "create API key" call, say) and
//! how its response maps onto the credential the profile stores; see
//! [`ProvisionOperation`]. This module owns the pieces that are pure
//! data-shaping — argument substitution and reading the mapped fields out
//! of the response — so `commands.rs` keeps to orchestration.

use std::collections::BTreeMap;

use crate::error::CliError;
use crate::profiles::ProvisionOperation;

/// Expand the placeholders a fixed argument may carry.
///
/// `{profile}` is the profile being created, `{cli}` the binary name,
/// `{hostname}` and `{user}` the machine and account running it — so a
/// configured `FriendlyName: "{cli} on {hostname}"` labels the key the way
/// a human would, and the API's console shows which machine owns it.
/// Unknown placeholders are left as written: an API may legitimately take
/// a literal `{…}`.
pub fn substitute(template: &str, profile: &str, cli_name: &str) -> String {
    template
        .replace("{profile}", profile)
        .replace("{cli}", cli_name)
        .replace("{hostname}", &hostname())
        .replace("{user}", &username())
}

fn hostname() -> String {
    std::env::var("HOSTNAME")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .or_else(|| {
            std::fs::read_to_string("/etc/hostname")
                .ok()
                .map(|value| value.trim().to_string())
                .filter(|value| !value.is_empty())
        })
        .or_else(|| std::env::var("COMPUTERNAME").ok())
        .unwrap_or_else(|| "unknown-host".to_string())
}

fn username() -> String {
    std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .ok()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "unknown-user".to_string())
}

/// The argument object the provision operation is invoked with: the
/// profile's stored parameters (the tenant it belongs to) with the
/// configured fixed arguments layered on top.
///
/// Fixed arguments win. The generator wrote them for this call
/// specifically, whereas a stored parameter of the same name is a default
/// meant for ordinary commands.
pub fn arguments(
    op: &ProvisionOperation,
    parameters: &BTreeMap<String, String>,
    profile: &str,
    cli_name: &str,
) -> serde_json::Value {
    let mut map: serde_json::Map<String, serde_json::Value> = parameters
        .iter()
        .map(|(k, v)| (k.clone(), serde_json::Value::String(v.clone())))
        .collect();
    for (name, template) in &op.arguments {
        map.insert(
            name.clone(),
            serde_json::Value::String(substitute(template, profile, cli_name)),
        );
    }
    serde_json::Value::Object(map)
}

/// Read a dotted path (`data.key.sid`) out of the response body as a
/// string. Numbers and booleans are stringified — an id is an id whatever
/// the JSON type — but an object, array or null is an error naming the
/// path, so a mapping that drifted from the API is reported rather than
/// stored as `[object]`.
pub fn response_field(response: &serde_json::Value, path: &str) -> Result<String, CliError> {
    let mut cursor = response;
    for segment in path.split('.') {
        cursor = match cursor {
            serde_json::Value::Object(map) => map.get(segment),
            serde_json::Value::Array(items) => segment
                .parse::<usize>()
                .ok()
                .and_then(|index| items.get(index)),
            _ => None,
        }
        .ok_or_else(|| {
            CliError::Validation(format!(
                "--provision: the response has no `{path}` field. Response keys: {}",
                top_level_keys(response),
            ))
        })?;
    }
    match cursor {
        serde_json::Value::String(value) if !value.is_empty() => Ok(value.clone()),
        serde_json::Value::Number(value) => Ok(value.to_string()),
        serde_json::Value::Bool(value) => Ok(value.to_string()),
        _ => Err(CliError::Validation(format!(
            "--provision: response field `{path}` is not a usable value \
             (expected a non-empty string)."
        ))),
    }
}

fn top_level_keys(response: &serde_json::Value) -> String {
    match response {
        serde_json::Value::Object(map) if !map.is_empty() => map
            .keys()
            .map(String::as_str)
            .collect::<Vec<_>>()
            .join(", "),
        serde_json::Value::Object(_) => "(none)".to_string(),
        other => format!("(response is {})", json_kind(other)),
    }
}

fn json_kind(value: &serde_json::Value) -> &'static str {
    match value {
        serde_json::Value::Null => "null",
        serde_json::Value::Bool(_) => "a boolean",
        serde_json::Value::Number(_) => "a number",
        serde_json::Value::String(_) => "a string",
        serde_json::Value::Array(_) => "an array",
        serde_json::Value::Object(_) => "an object",
    }
}

/// The credential the response yields, as `(field, value)` pairs in the
/// order the scheme declares its fields.
///
/// `expected` is what the scheme stores — `["username", "password"]` for
/// basic, `None` for a single-value scheme, which maps to the one field
/// `token`. Every expected field must be mapped; a configuration that maps
/// a field the scheme does not have is equally an error, since the value
/// would be written to the keyring and never read.
pub fn credential_values(
    op: &ProvisionOperation,
    response: &serde_json::Value,
    expected: Option<&[&'static str]>,
) -> Result<Vec<(String, String)>, CliError> {
    let expected: Vec<&str> = match expected {
        Some(fields) => fields.to_vec(),
        None => vec![TOKEN_FIELD],
    };
    if op.credential_fields.is_empty() {
        return Err(CliError::Validation(
            "--provision: this CLI's provision operation maps no credential fields, \
             so there is nothing to store. This is a generator configuration error."
                .to_string(),
        ));
    }
    if let Some(extra) = op
        .credential_fields
        .keys()
        .find(|field| !expected.contains(&field.as_str()))
    {
        return Err(CliError::Validation(format!(
            "--provision: the provision operation maps a `{extra}` credential field, \
             but this scheme stores {}. This is a generator configuration error.",
            describe_fields(&expected),
        )));
    }
    expected
        .iter()
        .map(|field| {
            let path = op.credential_fields.get(*field).ok_or_else(|| {
                CliError::Validation(format!(
                    "--provision: the provision operation does not say which response \
                     field supplies `{field}`. This is a generator configuration error."
                ))
            })?;
            Ok(((*field).to_string(), response_field(response, path)?))
        })
        .collect()
}

/// The field name a single-value scheme's credential is mapped under.
pub const TOKEN_FIELD: &str = "token";

fn describe_fields(fields: &[&str]) -> String {
    match fields {
        [one] => format!("only `{one}`"),
        many => many
            .iter()
            .map(|f| format!("`{f}`"))
            .collect::<Vec<_>>()
            .join(" and "),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn op() -> ProvisionOperation {
        ProvisionOperation::new("keys.create")
            .argument("FriendlyName", "{cli} ({profile})")
            .credential_field("username", "sid")
            .credential_field("password", "secret")
            .credential_id("sid")
    }

    #[test]
    fn fixed_arguments_are_substituted_and_win_over_profile_parameters() {
        let mut params = BTreeMap::new();
        params.insert("AccountSid".to_string(), "AC1".to_string());
        params.insert("FriendlyName".to_string(), "stale".to_string());
        let args = arguments(&op(), &params, "prod", "tw");
        assert_eq!(args["AccountSid"], "AC1");
        assert_eq!(args["FriendlyName"], "tw (prod)");
    }

    #[test]
    fn unknown_placeholders_are_left_alone() {
        assert_eq!(substitute("{nope} {profile}", "p", "c"), "{nope} p");
    }

    #[test]
    fn response_fields_follow_dotted_paths_and_stringify_scalars() {
        let body = serde_json::json!({"data": {"key": {"sid": "SK1", "n": 7, "ok": true}}});
        assert_eq!(response_field(&body, "data.key.sid").unwrap(), "SK1");
        assert_eq!(response_field(&body, "data.key.n").unwrap(), "7");
        assert_eq!(response_field(&body, "data.key.ok").unwrap(), "true");
        let err = response_field(&body, "data.key.missing")
            .unwrap_err()
            .to_string();
        assert!(err.contains("`data.key.missing`"), "{err}");
        assert!(err.contains("data"), "lists the top-level keys: {err}");
        let err = response_field(&body, "data.key").unwrap_err().to_string();
        assert!(err.contains("not a usable value"), "{err}");
    }

    #[test]
    fn credential_values_follow_the_scheme_field_order() {
        let body = serde_json::json!({"sid": "SK1", "secret": "s3"});
        let values = credential_values(&op(), &body, Some(&["username", "password"])).unwrap();
        assert_eq!(
            values,
            vec![
                ("username".to_string(), "SK1".to_string()),
                ("password".to_string(), "s3".to_string()),
            ]
        );
    }

    #[test]
    fn a_single_value_scheme_maps_the_token_field() {
        let op = ProvisionOperation::new("tokens.create").credential_field("token", "value");
        let body = serde_json::json!({"value": "tok"});
        let values = credential_values(&op, &body, None).unwrap();
        assert_eq!(values, vec![("token".to_string(), "tok".to_string())]);
    }

    #[test]
    fn a_mapping_that_does_not_match_the_scheme_is_a_configuration_error() {
        let body = serde_json::json!({"sid": "SK1", "secret": "s3"});
        // Basic scheme, but only one half mapped.
        let half = ProvisionOperation::new("k.c").credential_field("username", "sid");
        let err = credential_values(&half, &body, Some(&["username", "password"]))
            .unwrap_err()
            .to_string();
        assert!(err.contains("`password`"), "{err}");
        // Token scheme, but basic fields mapped.
        let err = credential_values(&op(), &body, None)
            .unwrap_err()
            .to_string();
        assert!(err.contains("only `token`"), "{err}");
        // Nothing mapped at all.
        let none = ProvisionOperation::new("k.c");
        let err = credential_values(&none, &body, None)
            .unwrap_err()
            .to_string();
        assert!(err.contains("maps no credential fields"), "{err}");
    }
}
