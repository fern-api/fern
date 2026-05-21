// This module is shared across multiple `tests/*.rs` integration binaries
// via `mod common`. Each binary uses a different subset of these helpers,
// so per-binary dead-code lints fire on the unused leftovers. Suppress
// at the module level rather than peppering every item with attributes.
#![allow(dead_code)]

use serde_json::Value;
use wiremock::matchers::{header_regex, method, path_regex};
use wiremock::{Match, Mock, MockServer, Request, ResponseTemplate};

/// Canonical path-parameter values matching the openapi-fixture-mappings.json stubs.
pub struct OpenApiFixtures;

impl OpenApiFixtures {
    pub const FILE_ID: &'static str = "file-1";
    pub const FOLDER_ID: &'static str = "folder-1";
    pub const USER_ID: &'static str = "user-1";
    pub const TOKEN: &'static str = "test-token";
}

/// Canonical values for the graphql-fixture wire tests.
pub struct GraphqlFixtures;

impl GraphqlFixtures {
    pub const NODE_ID: &'static str = "node-1";
    pub const TOKEN: &'static str = "test-token";
}

/// Matches when the JSON body's `variables` object contains all specified key-value pairs
/// (subset match — extra keys are allowed). Use in GraphQL tier-2 wire tests.
pub struct BodyVariablesContain(pub Value);

impl Match for BodyVariablesContain {
    fn matches(&self, request: &Request) -> bool {
        let Ok(body) = serde_json::from_slice::<Value>(&request.body) else {
            return false;
        };
        let Some(vars) = body.get("variables") else {
            return false;
        };
        let Some(expected) = self.0.as_object() else {
            return false;
        };
        for (key, expected_val) in expected {
            if vars.get(key) != Some(expected_val) {
                return false;
            }
        }
        true
    }
}

/// Matches when none of the named keys appear in the JSON body's `variables` object.
/// Use to assert that the CLI did not auto-emit a variable the user never supplied.
pub struct BodyVariablesAbsent(pub &'static [&'static str]);

impl Match for BodyVariablesAbsent {
    fn matches(&self, request: &Request) -> bool {
        let Ok(body) = serde_json::from_slice::<Value>(&request.body) else {
            return false;
        };
        let Some(vars) = body.get("variables").and_then(|v| v.as_object()) else {
            // No variables block at all — every key is trivially absent.
            return true;
        };
        self.0.iter().all(|k| !vars.contains_key(*k))
    }
}

/// Matches any request whose body contains a `"query"` key (minimal GraphQL check).
pub struct IsGraphqlRequest;

impl Match for IsGraphqlRequest {
    fn matches(&self, request: &Request) -> bool {
        serde_json::from_slice::<Value>(&request.body)
            .ok()
            .and_then(|v| v.get("query").cloned())
            .is_some()
    }
}

/// Load all stubs from a WireMock mappings JSON string into an in-process
/// MockServer. This is the in-process equivalent of the Docker WireMock
/// approach, but with no external dependencies and per-test isolation.
///
/// Loader rules:
///   - Method and path are always matched.
///   - `pathParameters` `equalTo` values are resolved into the path literal
///     so `/files/{file_id}` + `{file_id: "12345"}` becomes `/files/12345`.
///   - Remaining `{param}` placeholders become `[^/]+` wildcards.
///   - `Authorization: Bearer .+` is enforced when present in the mapping,
///     verifying the CLI sends auth on every real request.
///   - `queryParameters` and `bodyPatterns` are stripped — individual tests
///     that care about request shape add their own `expect(1)` mocks.
pub async fn mount_mappings(server: &MockServer, mappings_json: &str) {
    let doc: serde_json::Value =
        serde_json::from_str(mappings_json).expect("mappings JSON must be valid");

    for mapping in doc["mappings"].as_array().expect("mappings must be array") {
        let req = &mapping["request"];
        let resp = &mapping["response"];

        let http_method = req["method"].as_str().unwrap_or("GET");
        let template = req
            .get("urlPathTemplate")
            .or_else(|| req.get("url"))
            .and_then(|v| v.as_str())
            .unwrap_or("/");
        let status = resp["status"].as_u64().unwrap_or(200) as u16;
        let body = resp["body"].as_str().unwrap_or("");

        let resolved = resolve_path(template, req.get("pathParameters"));
        let regex = template_to_path_regex(&resolved);

        let has_auth_check = req
            .get("headers")
            .and_then(|h| h.get("Authorization"))
            .is_some();

        // Propagate response headers so the CLI can correctly determine the
        // response format. set_body_string() forces Content-Type: text/plain,
        // so use set_body_json() for JSON responses — that way the CLI won't
        // treat the body as a binary download.
        let resp_content_type = resp
            .get("headers")
            .and_then(|h| h.get("Content-Type"))
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let mut response =
            if resp_content_type.contains("application/json") {
                if let Ok(json_body) = serde_json::from_str::<serde_json::Value>(body) {
                    ResponseTemplate::new(status).set_body_json(json_body)
                } else {
                    ResponseTemplate::new(status).set_body_string(body)
                }
            } else {
                ResponseTemplate::new(status).set_body_string(body)
            };
        if let Some(headers) = resp.get("headers").and_then(|h| h.as_object()) {
            for (name, value) in headers {
                if name.to_lowercase() == "content-type" {
                    continue; // already handled by the body setter above
                }
                if let Some(v) = value.as_str() {
                    response = response.insert_header(name.as_str(), v);
                }
            }
        }

        if has_auth_check {
            Mock::given(method(http_method))
                .and(path_regex(regex))
                .and(header_regex("Authorization", "Bearer .+"))
                .respond_with(response)
                .mount(server)
                .await;
        } else {
            Mock::given(method(http_method))
                .and(path_regex(regex))
                .respond_with(response)
                .mount(server)
                .await;
        }
    }
}

/// Substitute `{param}` placeholders with their `equalTo` canonical values
/// from the mapping's `pathParameters` block.
fn resolve_path(template: &str, path_params: Option<&serde_json::Value>) -> String {
    let mut result = template.to_string();
    if let Some(obj) = path_params.and_then(|v| v.as_object()) {
        for (param, matcher) in obj {
            if let Some(value) = matcher.get("equalTo").and_then(|v| v.as_str()) {
                result = result.replace(&format!("{{{param}}}"), value);
            }
        }
    }
    result
}

/// Convert a path template (possibly still containing `{param}` placeholders)
/// into a full anchored regex string suitable for `path_regex(...)`.
fn template_to_path_regex(template: &str) -> String {
    let mut result = String::from("^");
    let mut chars = template.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '{' {
            // consume the placeholder name up to and including '}'
            for c in chars.by_ref() {
                if c == '}' {
                    break;
                }
            }
            result.push_str("[^/]+");
        } else {
            // escape regex metacharacters in literal path segments
            match ch {
                '.' | '+' | '*' | '?' | '(' | ')' | '[' | ']' | '^' | '$' | '|' | '\\' => {
                    result.push('\\');
                    result.push(ch);
                }
                _ => result.push(ch),
            }
        }
    }
    result.push('$');
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_path_substitutes_known_params() {
        let params = serde_json::json!({"file_id": {"equalTo": "12345"}});
        assert_eq!(
            resolve_path("/files/{file_id}", Some(&params)),
            "/files/12345"
        );
    }

    #[test]
    fn resolve_path_leaves_unknown_params() {
        let params = serde_json::json!({"file_id": {"matches": "\\d+"}});
        assert_eq!(
            resolve_path("/files/{file_id}", Some(&params)),
            "/files/{file_id}"
        );
    }

    #[test]
    fn template_to_path_regex_exact() {
        assert_eq!(template_to_path_regex("/users/me"), "^/users/me$");
    }

    #[test]
    fn template_to_path_regex_single_param() {
        assert_eq!(
            template_to_path_regex("/files/{file_id}"),
            "^/files/[^/]+$"
        );
    }

    #[test]
    fn template_to_path_regex_multi_param() {
        assert_eq!(
            template_to_path_regex("/automations/{exec_id}/nodes/{node_id}"),
            "^/automations/[^/]+/nodes/[^/]+$"
        );
    }

    #[test]
    fn template_to_path_regex_escapes_dot() {
        // e.g. /files/{file_id}/thumbnail.{extension}
        let re = template_to_path_regex("/files/{file_id}/thumbnail.{extension}");
        assert_eq!(re, "^/files/[^/]+/thumbnail\\.[^/]+$");
        assert!(re.contains("\\."), "dot must be escaped so it only matches a literal dot");
    }
}
