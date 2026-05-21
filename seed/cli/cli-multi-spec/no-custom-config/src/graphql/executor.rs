//! GraphQL Request Execution
//!
//! Builds and dispatches POST requests carrying GraphQL operations.
//! Handles auth, response unwrapping (`data` envelope and `errors`),
//! and cursor-based pagination via `pageInfo.endCursor`.

use std::collections::HashMap;

use anyhow::Context;
use serde_json::{json, Map, Value};

use crate::auth::{handle_error_response, DynAuthProvider, EndpointAuthMetadata};
use crate::error::CliError;
use crate::graphql::discovery::{
    GraphQLArgDef, GraphQLMethodInfo, GraphQLOperation, GraphQLSchema, MethodParameter,
};

/// Configuration for cursor-based auto-pagination.
#[derive(Debug, Clone)]
pub struct PaginationConfig {
    /// Whether to auto-paginate through all pages.
    pub page_all: bool,
    /// Maximum number of pages to fetch (default: 10).
    pub page_limit: u32,
    /// Delay between page fetches in milliseconds (default: 100).
    pub page_delay_ms: u64,
}

impl Default for PaginationConfig {
    fn default() -> Self {
        Self {
            page_all: false,
            page_limit: 10,
            page_delay_ms: 100,
        }
    }
}

/// Parsed inputs ready for request execution.
#[derive(Debug)]
struct ExecutionInput {
    params: Map<String, Value>,
    body: Value,
    full_url: String,
}

fn parse_and_validate_inputs(
    doc: &GraphQLSchema,
    method: &GraphQLOperation,
    params_json: Option<&str>,
    body_json: Option<&str>,
    base_url_override: Option<&str>,
) -> Result<ExecutionInput, CliError> {
    let params: Map<String, Value> = if let Some(p) = params_json {
        serde_json::from_str(p)
            .map_err(|e| CliError::Validation(format!("Invalid --params JSON: {e}")))?
    } else {
        Map::new()
    };

    let gql = method.graphql.as_ref().ok_or_else(|| {
        CliError::Discovery("GraphQL method info missing from spec".to_string())
    })?;

    for (param_name, param_def) in &method.parameters {
        if param_def.required
            && !params.contains_key(param_name)
            && param_def.graphql_input_arg.is_none()
        {
            return Err(CliError::Validation(format!(
                "Required parameter '{param_name}' is missing"
            )));
        }
    }

    let body = build_graphql_body(gql, &params, body_json, &method.parameters, None)?;
    let full_url = base_url_override
        .map(|u| u.trim_end_matches('/').to_string())
        .unwrap_or_else(|| doc.root_url.clone());

    Ok(ExecutionInput { params, body, full_url })
}

/// Build a POST request with auth and a JSON GraphQL body.
fn build_http_request(
    client: &reqwest::Client,
    input: &ExecutionInput,
    auth_provider: &DynAuthProvider,
) -> Result<reqwest::RequestBuilder, CliError> {
    let request = client.post(&input.full_url);
    // GraphQL has no per-operation security metadata in the introspection
    // schema, so the metadata is always "unspecified" — the provider's own
    // default policy decides what to attach.
    let request = auth_provider.apply(request, &EndpointAuthMetadata::unspecified())?;
    let request = request
        .header("Content-Type", "application/json")
        .json(&input.body);
    Ok(request)
}

/// Parse a GraphQL response body: surface `errors` and unwrap the `data` envelope.
///
/// GraphQL allows partial results: a response may have both `data` and `errors`
/// (common in federation). When both are present, errors are printed to stderr
/// and the partial data is returned. Only when there is no `data` at all do we
/// treat the errors as fatal.
fn parse_graphql_response(body_text: &str) -> Result<String, CliError> {
    let json_val: Value = serde_json::from_str(body_text).map_err(|e| CliError::Api {
        code: 400,
        message: format!("Invalid GraphQL response: {e}"),
        reason: "graphql_parse_error".to_string(),
    })?;

    let has_data = json_val
        .get("data")
        .map(|d| !d.is_null())
        .unwrap_or(false);

    if let Some(errors) = json_val.get("errors").and_then(|e| e.as_array()) {
        if !errors.is_empty() {
            let message = errors
                .iter()
                .filter_map(|e| e.get("message").and_then(|m| m.as_str()))
                .collect::<Vec<_>>()
                .join("; ");
            if has_data {
                eprintln!("GraphQL partial errors: {message}");
            } else {
                return Err(CliError::Api {
                    code: 400,
                    message,
                    reason: "graphql_error".to_string(),
                });
            }
        }
    }

    let unwrapped = if let Some(data) = json_val.get("data").filter(|d| !d.is_null()) {
        if let Value::Object(map) = data {
            if map.len() == 1 {
                map.values().next().unwrap().clone()
            } else {
                data.clone()
            }
        } else {
            data.clone()
        }
    } else {
        json_val
    };

    serde_json::to_string(&unwrapped).map_err(|e| CliError::Api {
        code: 500,
        message: format!("Failed to serialize GraphQL response: {e}"),
        reason: "graphql_serialize_error".to_string(),
    })
}

/// Print or capture a JSON response and bump the page counter.
async fn handle_json_response(
    body_text: &str,
    pipeline: &crate::formatter::OutputPipeline,
    pages_fetched: &mut u32,
    page_all: bool,
    capture_output: bool,
    captured: &mut Vec<Value>,
) -> Result<(), CliError> {
    if let Ok(json_val) = serde_json::from_str::<Value>(body_text) {
        *pages_fetched += 1;

        if capture_output {
            captured.push(json_val);
        } else if page_all {
            let is_first_page = *pages_fetched == 1;
            let mut out = std::io::stdout().lock();
            pipeline
                .emit(&mut out, &json_val, true, is_first_page)
                .context("Failed to write output")?;
        } else {
            let mut out = std::io::stdout().lock();
            pipeline
                .emit(&mut out, &json_val, false, true)
                .context("Failed to write output")?;
        }
    } else if !capture_output && !body_text.is_empty() {
        println!("{body_text}");
    }
    Ok(())
}


/// Executes a GraphQL operation.
///
/// Posts the rendered query to the schema's endpoint, unwraps the `data` envelope,
/// and continues paginating via `pageInfo.endCursor` until the page limit is hit.
#[allow(clippy::too_many_arguments)]
pub async fn execute_method(
    doc: &GraphQLSchema,
    method: &GraphQLOperation,
    params_json: Option<&str>,
    body_json: Option<&str>,
    auth_provider: &DynAuthProvider,
    dry_run: bool,
    pagination: &PaginationConfig,
    pipeline: &crate::formatter::OutputPipeline,
    capture_output: bool,
    base_url_override: Option<&str>,
    http_config: &crate::http::HttpConfig,
) -> Result<Option<Value>, CliError> {
    let mut input =
        parse_and_validate_inputs(doc, method, params_json, body_json, base_url_override)?;

    if dry_run {
        let dry_run_info = json!({
            "dry_run": true,
            "url": input.full_url,
            "method": "POST",
            "body": input.body,
        });
        if capture_output {
            return Ok(Some(dry_run_info));
        }
        let mut out = std::io::stdout().lock();
        pipeline
            .emit(&mut out, &dry_run_info, false, true)
            .context("Failed to write output")?;
        return Ok(None);
    }

    let mut pages_fetched: u32 = 0;
    let mut captured_values = Vec::new();

    // Build the client once outside the pagination loop. Client construction
    // reads env vars and (with TLS) builds a connection pool; rebuilding per
    // page would defeat connection reuse and emit any one-time warnings
    // (e.g. insecure-mode) once per page.
    let client = http_config.build_client()?;

    loop {
        let request = build_http_request(&client, &input, auth_provider)?;

        let method_id = method.id.as_deref().unwrap_or("unknown");
        let start = std::time::Instant::now();
        let response = match request.send().await {
            Ok(resp) => resp,
            Err(e) => {
                // Surface a human-readable hint to stderr if this looks like
                // a TLS failure — the most common debugging hump for users
                // behind corporate proxies / interception tools. The hint is
                // a side effect; the error then propagates up like any other.
                crate::http::maybe_emit_tls_hint(http_config, &e);
                return Err(anyhow::Error::from(e).context("HTTP request failed").into());
            }
        };
        let latency_ms = start.elapsed().as_millis() as u64;

        let status = response.status();

        if !status.is_success() {
            let error_body = response.text().await.unwrap_or_default();
            tracing::warn!(
                api_method = method_id,
                http_method = "POST",
                status = status.as_u16(),
                latency_ms = latency_ms,
                "API error"
            );
            return handle_error_response(
                status,
                &error_body,
                auth_provider.as_ref(),
                &EndpointAuthMetadata::unspecified(),
            );
        }

        tracing::debug!(
            api_method = method_id,
            http_method = "POST",
            status = status.as_u16(),
            latency_ms = latency_ms,
            page = pages_fetched,
            "API request"
        );

        let body_text = response
            .text()
            .await
            .context("Failed to read response body")?;
        let response_body = parse_graphql_response(&body_text)?;

        handle_json_response(
            &response_body,
            pipeline,
            &mut pages_fetched,
            pagination.page_all,
            capture_output,
            &mut captured_values,
        )
        .await?;

        // GraphQL cursor-based pagination: rebuild the body with the next
        // cursor and POST again until we run out of pages or hit the limit.
        if pagination.page_all {
            if let Some(cursor) = extract_graphql_cursor(&response_body) {
                if pages_fetched < pagination.page_limit {
                    if let Some(ref gql_info) = method.graphql {
                        let params_clone = input.params.clone();
                        input.body = build_graphql_body(
                            gql_info,
                            &params_clone,
                            body_json,
                            &method.parameters,
                            Some(&cursor),
                        )?;
                    }
                    if pagination.page_delay_ms > 0 {
                        tokio::time::sleep(std::time::Duration::from_millis(
                            pagination.page_delay_ms,
                        ))
                        .await;
                    }
                    continue;
                }
            }
        }

        break;
    }

    if capture_output && !captured_values.is_empty() {
        if captured_values.len() == 1 {
            return Ok(Some(captured_values.pop().unwrap()));
        } else {
            return Ok(Some(Value::Array(captured_values)));
        }
    }

    Ok(None)
}

/// Build a GraphQL request body using the variables mechanism.
///
/// User-supplied values are placed in the `variables` JSON object and referenced
/// via `$name: Type` declarations in the query — they never appear in the query
/// string itself, preventing GraphQL injection.
///
/// `cursor` injects an `after` variable for cursor-based pagination when
/// `page-all` is in effect; it is only applied when the method declares an
/// `after` argument.
fn build_graphql_body(
    gql: &GraphQLMethodInfo,
    params: &Map<String, Value>,
    body_json: Option<&str>,
    method_params: &HashMap<String, MethodParameter>,
    cursor: Option<&str>,
) -> Result<Value, CliError> {
    let mut variables: Map<String, Value> = Map::new();

    // Parse --json once; it targets the first input arg only.
    let body_obj: Option<Map<String, Value>> = if let Some(json_str) = body_json {
        let json_val: Value = serde_json::from_str(json_str)
            .map_err(|e| CliError::Validation(format!("Invalid --json body: {e}")))?;
        match json_val {
            Value::Object(obj) => Some(obj),
            _ => None,
        }
    } else {
        None
    };
    let mut json_applied = false;

    for arg_def in &gql.args {
        if arg_def.is_input {
            // Reconstruct the input object from flattened CLI flags. Each flag
            // tagged with this arg_name carries a graphql_field_path (dotted
            // camelCase path within the input) for nested field placement.
            let mut input_obj: Map<String, Value> = Map::new();
            for (flag_key, value) in params {
                if let Some(mp) = method_params.get(flag_key) {
                    if mp.graphql_input_arg.as_deref() == Some(arg_def.name.as_str()) {
                        let coerced = coerce_graphql_value(value, Some(mp));
                        if let Some(path) = mp.graphql_field_path.as_deref() {
                            set_nested_value(&mut input_obj, path, coerced);
                        } else {
                            let camel = kebab_to_camel(flag_key);
                            set_nested_value(&mut input_obj, &camel, coerced);
                        }
                    }
                }
            }
            // --json targets the first input arg only (deep-merges at the top level).
            if !json_applied {
                if let Some(ref obj) = body_obj {
                    for (k, v) in obj {
                        input_obj.insert(k.clone(), v.clone());
                    }
                    json_applied = true;
                }
            }
            if !input_obj.is_empty() {
                // For list-typed input arguments (e.g. `arg: [SomeInput!]`), the
                // variable must be serialized as a JSON array. The GraphQL spec
                // defines input coercion that lifts a single value into a singleton
                // list, but coercion of typed *variables* is not uniformly enforced
                // across server implementations — emitting an explicit array is the
                // portable, spec-conformant shape. We currently flatten one element's
                // worth of fields, so wrap the reconstructed object accordingly.
                let value = if arg_def.is_list {
                    Value::Array(vec![Value::Object(input_obj)])
                } else {
                    Value::Object(input_obj)
                };
                variables.insert(arg_def.name.clone(), value);
            }
        } else {
            // Direct scalar/enum arg: look it up by its CLI flag key.
            if let Some(value) = params.get(&arg_def.flag_key) {
                let coerced = coerce_graphql_value(value, method_params.get(&arg_def.flag_key));
                variables.insert(arg_def.name.clone(), coerced);
            }
        }
    }

    // Inject pagination cursor when the method declares an `after` argument.
    if let Some(cursor_val) = cursor {
        if gql.args.iter().any(|a| a.name == "after") {
            variables.insert("after".to_string(), Value::String(cursor_val.to_string()));
        }
    }

    let op_type = &gql.operation_type;
    let field_name = &gql.field_name;
    let selection = &gql.default_selection;

    let query = if variables.is_empty() {
        format!("{op_type} {{ {field_name} {selection} }}")
    } else {
        let present_args: Vec<&GraphQLArgDef> = gql
            .args
            .iter()
            .filter(|a| variables.contains_key(&a.name))
            .collect();
        let decls = present_args
            .iter()
            .map(|a| format!("${}: {}", a.name, a.gql_type))
            .collect::<Vec<_>>()
            .join(", ");
        let refs = present_args
            .iter()
            .map(|a| format!("{}: ${}", a.name, a.name))
            .collect::<Vec<_>>()
            .join(", ");
        format!("{op_type}({decls}) {{ {field_name}({refs}) {selection} }}")
    };

    Ok(json!({
        "query": query,
        "variables": variables,
    }))
}

/// Set a value at a dotted camelCase path within a JSON object, creating
/// intermediate objects as needed. E.g., path `"dateRange.start"` sets
/// `obj["dateRange"]["start"] = value`.
fn set_nested_value(obj: &mut Map<String, Value>, path: &str, value: Value) {
    match path.split_once('.') {
        None => {
            obj.insert(path.to_string(), value);
        }
        Some((head, tail)) => {
            let nested = obj
                .entry(head.to_string())
                .or_insert_with(|| Value::Object(Map::new()));
            if let Value::Object(nested_map) = nested {
                set_nested_value(nested_map, tail, value);
            }
        }
    }
}

/// Extract `endCursor` from an unwrapped GraphQL response when `hasNextPage` is true.
fn extract_graphql_cursor(response_body: &str) -> Option<String> {
    let val: Value = serde_json::from_str(response_body).ok()?;
    let page_info = val.get("pageInfo")?;
    let has_next = page_info.get("hasNextPage")?.as_bool()?;
    if !has_next {
        return None;
    }
    page_info
        .get("endCursor")?
        .as_str()
        .map(|s| s.to_string())
}

/// Coerce a JSON value to the correct type based on the parameter definition.
/// CLI flags always come in as strings; this converts "3" → 3 for integers, etc.
fn coerce_graphql_value(value: &Value, param_def: Option<&MethodParameter>) -> Value {
    if let Value::String(s) = value {
        if let Some(def) = param_def {
            match def.param_type.as_deref() {
                Some("integer") => {
                    if let Ok(n) = s.parse::<i64>() {
                        return Value::Number(n.into());
                    }
                }
                Some("number") => {
                    if let Ok(n) = s.parse::<f64>() {
                        if let Some(num) = serde_json::Number::from_f64(n) {
                            return Value::Number(num);
                        }
                    }
                }
                Some("boolean") => match s.as_str() {
                    "true" => return Value::Bool(true),
                    "false" => return Value::Bool(false),
                    _ => {}
                },
                _ => {}
            }
        }
    }
    value.clone()
}

/// Convert kebab-case to camelCase.
fn kebab_to_camel(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut capitalize_next = false;
    for ch in s.chars() {
        if ch == '-' {
            capitalize_next = true;
        } else if capitalize_next {
            result.push(ch.to_uppercase().next().unwrap());
            capitalize_next = false;
        } else {
            result.push(ch);
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_pagination_config_default() {
        let config = PaginationConfig::default();
        assert!(!config.page_all);
        assert_eq!(config.page_limit, 10);
        assert_eq!(config.page_delay_ms, 100);
    }

    // -----------------------------------------------------------------------
    // handle_json_response
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn test_handle_json_response_capture_output() {
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut captured = Vec::new();

        handle_json_response(
            r#"{"items":["a"]}"#,
            &pipeline,
            &mut pages_fetched,
            false,
            true,
            &mut captured,
        )
        .await
        .unwrap();

        assert_eq!(captured.len(), 1);
        assert_eq!(pages_fetched, 1);
    }

    #[tokio::test]
    async fn test_handle_json_response_non_json_body() {
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut captured = Vec::new();

        handle_json_response(
            "not json at all",
            &pipeline,
            &mut pages_fetched,
            false,
            false,
            &mut captured,
        )
        .await
        .unwrap();

        assert_eq!(pages_fetched, 0);
    }

    // -----------------------------------------------------------------------
    // build_http_request
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn test_build_http_request_posts_json_body() {
        let client = reqwest::Client::new();
        let input = ExecutionInput {
            full_url: "https://example.com/graphql".to_string(),
            body: json!({"query": "{ ping }", "variables": {}}),
            params: Map::new(),
        };

        let request = build_http_request(&client, &input, &crate::auth::no_auth_provider()).unwrap();
        let built = request.build().unwrap();

        assert_eq!(built.method(), "POST");
        assert_eq!(
            built
                .headers()
                .get("Content-Type")
                .and_then(|v| v.to_str().ok()),
            Some("application/json"),
        );
    }

    // -----------------------------------------------------------------------
    // execute_method
    // -----------------------------------------------------------------------

    fn minimal_ping_doc_and_method() -> (GraphQLSchema, GraphQLOperation) {
        let doc = GraphQLSchema {
            name: "test".to_string(),
            version: "v1".to_string(),
            root_url: "https://example.com/graphql".to_string(),
            ..Default::default()
        };
        let method = GraphQLOperation {
            id: Some("ping".to_string()),
            graphql: Some(crate::graphql::discovery::GraphQLMethodInfo {
                operation_type: "query".to_string(),
                field_name: "ping".to_string(),
                default_selection: String::new(),
                args: Vec::new(),
            }),
            ..Default::default()
        };
        (doc, method)
    }

    #[tokio::test]
    async fn test_execute_method_dry_run_with_http_config() {
        // dry_run skips network I/O entirely, but still exercises the new
        // http_config parameter path — proving that the caller's
        // HttpConfig is plumbed all the way to execute_method.
        let (doc, method) = minimal_ping_doc_and_method();
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let http_config = crate::http::HttpConfig::new("test").unwrap();

        let result = execute_method(
            &doc,
            &method,
            None,
            None,
            &crate::auth::no_auth_provider(),
            true, // dry_run
            &pagination,
            &pipeline,
            true, // capture_output
            None,
            &http_config,
        )
        .await
        .expect("dry-run should succeed");

        let value = result.expect("dry-run with capture_output should return Some");
        assert_eq!(value["dry_run"], json!(true));
        assert_eq!(value["url"], json!("https://example.com/graphql"));
        assert_eq!(value["method"], json!("POST"));
    }

    // -----------------------------------------------------------------------
    // parse_graphql_response
    // -----------------------------------------------------------------------

    #[test]
    fn test_parse_graphql_response_errors_only_is_fatal() {
        let body = json!({
            "errors": [{"message": "Not found"}]
        })
        .to_string();
        let result = parse_graphql_response(&body);
        assert!(result.is_err(), "errors-only should be fatal");
    }

    #[test]
    fn test_parse_graphql_response_errors_and_data_returns_data() {
        let body = json!({
            "data": {"node": {"id": "n1", "name": "test"}},
            "errors": [{"message": "partial failure"}]
        })
        .to_string();
        let result = parse_graphql_response(&body).expect("errors+data should succeed");
        let val: Value = serde_json::from_str(&result).unwrap();
        assert_eq!(val["id"], "n1", "partial data should be returned");
    }

    #[test]
    fn test_parse_graphql_response_null_data_with_errors_is_fatal() {
        let body = json!({
            "data": null,
            "errors": [{"message": "fatal"}]
        })
        .to_string();
        let result = parse_graphql_response(&body);
        assert!(result.is_err(), "null data + errors should be fatal");
    }

    #[test]
    fn test_parse_graphql_response_unwraps_single_field() {
        let body = json!({
            "data": {"issues": {"nodes": [{"id": "i1"}]}}
        })
        .to_string();
        let result = parse_graphql_response(&body).unwrap();
        let val: Value = serde_json::from_str(&result).unwrap();
        assert!(val.get("nodes").is_some(), "should unwrap single-field data envelope");
    }

    // -----------------------------------------------------------------------
    // extract_graphql_cursor
    // -----------------------------------------------------------------------

    #[test]
    fn test_extract_graphql_cursor_returns_cursor_when_has_next() {
        let body = json!({
            "nodes": [],
            "pageInfo": {"hasNextPage": true, "endCursor": "cursor-abc"}
        })
        .to_string();
        let cursor = extract_graphql_cursor(&body);
        assert_eq!(cursor, Some("cursor-abc".to_string()));
    }

    #[test]
    fn test_extract_graphql_cursor_returns_none_when_no_next() {
        let body = json!({
            "nodes": [],
            "pageInfo": {"hasNextPage": false, "endCursor": "cursor-abc"}
        })
        .to_string();
        assert_eq!(extract_graphql_cursor(&body), None);
    }

    #[test]
    fn test_extract_graphql_cursor_returns_none_when_no_page_info() {
        let body = json!({"nodes": []}).to_string();
        assert_eq!(extract_graphql_cursor(&body), None);
    }

    // -----------------------------------------------------------------------
    // set_nested_value
    // -----------------------------------------------------------------------

    #[test]
    fn test_set_nested_value_flat() {
        let mut obj = Map::new();
        set_nested_value(&mut obj, "name", Value::String("alice".to_string()));
        assert_eq!(obj["name"], "alice");
    }

    #[test]
    fn test_set_nested_value_two_levels() {
        let mut obj = Map::new();
        set_nested_value(
            &mut obj,
            "dateRange.start",
            Value::String("2024-01-01".to_string()),
        );
        set_nested_value(
            &mut obj,
            "dateRange.end",
            Value::String("2024-12-31".to_string()),
        );
        let date_range = obj["dateRange"].as_object().unwrap();
        assert_eq!(date_range["start"], "2024-01-01");
        assert_eq!(date_range["end"], "2024-12-31");
    }

    #[test]
    fn test_set_nested_value_three_levels() {
        let mut obj = Map::new();
        set_nested_value(&mut obj, "a.b.c", Value::String("deep".to_string()));
        assert_eq!(obj["a"]["b"]["c"], "deep");
    }

    // -----------------------------------------------------------------------
    // build_graphql_body
    // -----------------------------------------------------------------------

    #[test]
    fn test_build_graphql_body_injects_cursor_when_after_arg_present() {
        let gql = GraphQLMethodInfo {
            operation_type: "query".to_string(),
            field_name: "nodes".to_string(),
            default_selection: "{ nodes { id } pageInfo { hasNextPage endCursor } }".to_string(),
            args: vec![
                GraphQLArgDef {
                    name: "first".to_string(),
                    flag_key: "first".to_string(),
                    gql_type: "Int".to_string(),
                    is_input: false,
                    is_list: false,
                },
                GraphQLArgDef {
                    name: "after".to_string(),
                    flag_key: "after".to_string(),
                    gql_type: "String".to_string(),
                    is_input: false,
                    is_list: false,
                },
            ],
        };
        let params = Map::new();
        let method_params: HashMap<String, MethodParameter> = HashMap::new();

        let body =
            build_graphql_body(&gql, &params, None, &method_params, Some("cursor-xyz")).unwrap();
        let vars = body["variables"].as_object().unwrap();
        assert_eq!(vars.get("after").and_then(|v| v.as_str()), Some("cursor-xyz"));
        assert!(body["query"].as_str().unwrap().contains("$after: String"));
    }

    #[test]
    fn test_build_graphql_body_no_cursor_when_no_after_arg() {
        let gql = GraphQLMethodInfo {
            operation_type: "query".to_string(),
            field_name: "node".to_string(),
            default_selection: "{ id name }".to_string(),
            args: vec![GraphQLArgDef {
                name: "id".to_string(),
                flag_key: "id".to_string(),
                gql_type: "String!".to_string(),
                is_input: false,
                is_list: false,
            }],
        };
        let mut params = Map::new();
        params.insert("id".to_string(), Value::String("n1".to_string()));
        let method_params: HashMap<String, MethodParameter> = HashMap::new();

        let body =
            build_graphql_body(&gql, &params, None, &method_params, Some("cursor-xyz")).unwrap();
        let vars = body["variables"].as_object().unwrap();
        assert!(vars.get("after").is_none(), "no after arg = cursor not injected");
    }

    #[test]
    fn test_build_graphql_body_reconstructs_nested_input() {
        let gql = GraphQLMethodInfo {
            operation_type: "query".to_string(),
            field_name: "filteredNodes".to_string(),
            default_selection: "{ nodes { id } }".to_string(),
            args: vec![GraphQLArgDef {
                name: "filter".to_string(),
                flag_key: "filter".to_string(),
                gql_type: "NodeFilter".to_string(),
                is_input: true,
                is_list: false,
            }],
        };

        let mut params = Map::new();
        params.insert(
            "date-range-start".to_string(),
            Value::String("2024-01-01".to_string()),
        );
        params.insert(
            "date-range-end".to_string(),
            Value::String("2024-12-31".to_string()),
        );

        let mut method_params: HashMap<String, MethodParameter> = HashMap::new();
        method_params.insert(
            "date-range-start".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                graphql_input_arg: Some("filter".to_string()),
                graphql_field_path: Some("dateRange.start".to_string()),
                ..Default::default()
            },
        );
        method_params.insert(
            "date-range-end".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                graphql_input_arg: Some("filter".to_string()),
                graphql_field_path: Some("dateRange.end".to_string()),
                ..Default::default()
            },
        );

        let body = build_graphql_body(&gql, &params, None, &method_params, None).unwrap();
        let filter = body["variables"]["filter"].as_object().unwrap();
        let date_range = filter["dateRange"].as_object().unwrap();
        assert_eq!(date_range["start"], "2024-01-01");
        assert_eq!(date_range["end"], "2024-12-31");
    }
}
