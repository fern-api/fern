# Plan A: Typed Flags & Parameter Handling

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Update `ROADMAP_TRACKER.md` after each task.

**Goal:** Transform the CLI from `--params` JSON blobs to individual typed flags per parameter, with dot-notation for nested objects, proper query serialization styles, and header parameter support.

**Architecture:** In `commands.rs`, generate a `clap::Arg` for each OpenAPI parameter on every method. In `app.rs`, collect individual flag values into the params map before passing to the executor. The executor's `parse_and_validate_inputs` is unchanged — it still receives a params `Map<String, Value>`. The new code sits between clap parsing and executor invocation. Keep `--params` as an override escape hatch.

**Tech Stack:** Rust, clap 4 (value_parser, PossibleValuesParser)

**Spec:** `DESIGN.md` (Flag generation design section + Roadmap items 1-3, 6)

**Build/test commands:** All cargo commands require `nix develop --command` prefix.

---

## File Map

| File | Change | Responsibility |
|------|--------|----------------|
| `src/commands.rs` | **Major edit** | Add per-parameter `clap::Arg` to each method command |
| `src/app.rs` | **Edit** | Collect individual flag values into params map; collect header params |
| `src/executor.rs` | **Edit** | Accept and send header params; support query serialization styles |
| `src/discovery.rs` | **Edit** | Add `style`/`explode` fields to `MethodParameter` |
| `src/openapi.rs` | **Edit** | Parse `style`/`explode` from OpenAPI params |
| `tests/cli_integration.rs` | **Edit** | Add integration tests for typed flags |
| `tests/lib_api.rs` | **Edit** | Add library API tests for flag generation |

---

### Task 1: Generate individual flags from parameters in `commands.rs`

The core change: each method's parameters become dedicated clap args.

**Files:**
- Modify: `src/commands.rs`

- [ ] **Step 1: Add `snake_to_kebab` helper**

Add to `commands.rs`:
```rust
/// Convert snake_case parameter names to kebab-case flag names.
/// "min_start_time" → "min-start-time"
fn snake_to_kebab(s: &str) -> String {
    s.replace('_', "-")
}
```

- [ ] **Step 2: Generate per-parameter args in `build_resource_command`**

After the existing `--params` and `--output` args, add a loop that generates a flag for each parameter on the method:

```rust
// Generate individual flags from method parameters
let mut param_names: Vec<_> = method.parameters.keys().collect();
param_names.sort();
for param_name in param_names {
    let param = &method.parameters[param_name];

    // Skip params that conflict with built-in flags
    if matches!(param_name.as_str(), "params" | "output" | "json" | "format"
        | "dry-run" | "page-all" | "page-limit" | "page-delay") {
        continue;
    }

    let flag_name = snake_to_kebab(param_name);
    let mut arg = Arg::new(param_name.clone())
        .long(flag_name)
        .value_name(param.param_type.as_deref().unwrap_or("VALUE").to_uppercase());

    if let Some(ref desc) = param.description {
        arg = arg.help(crate::text::truncate_description(
            desc,
            crate::text::CLI_DESCRIPTION_LIMIT,
            true,
        ));
    }

    if param.required {
        // Don't mark as required in clap — --params can still provide it
        // Instead, validation happens in the executor
    }

    if let Some(ref default) = param.default {
        arg = arg.default_value(default.clone());
    }

    if let Some(ref values) = param.enum_values {
        arg = arg.value_parser(
            clap::builder::PossibleValuesParser::new(values.iter().map(|s| s.as_str()))
        );
    }

    method_cmd = method_cmd.arg(arg);
}
```

- [ ] **Step 3: Update `--params` help text**

Change the `--params` arg help to indicate it's an override:
```rust
.help("Additional parameters as JSON (overrides individual flags)")
```

- [ ] **Step 4: Add tests for flag generation**

Add to `commands.rs` tests:
```rust
#[test]
fn test_method_params_become_flags() {
    let mut params = HashMap::new();
    params.insert("uuid".to_string(), MethodParameter {
        param_type: Some("string".to_string()),
        description: Some("The user ID".to_string()),
        location: Some("path".to_string()),
        required: true,
        ..Default::default()
    });
    params.insert("status".to_string(), MethodParameter {
        param_type: Some("string".to_string()),
        enum_values: Some(vec!["active".to_string(), "canceled".to_string()]),
        location: Some("query".to_string()),
        ..Default::default()
    });

    let mut methods = HashMap::new();
    methods.insert("get-user".to_string(), RestMethod {
        http_method: "GET".to_string(),
        path: "/users/{uuid}".to_string(),
        parameters: params,
        ..Default::default()
    });

    let mut resources = HashMap::new();
    resources.insert("users".to_string(), RestResource {
        methods,
        resources: HashMap::new(),
    });

    let doc = RestDescription {
        name: "test".to_string(),
        resources,
        ..Default::default()
    };

    let cmd = build_cli(&doc);
    let users = cmd.find_subcommand("users").unwrap();
    let get_user = users.find_subcommand("get-user").unwrap();

    // Should have --uuid and --status flags
    let args: Vec<_> = get_user.get_arguments().map(|a| a.get_id().as_str()).collect();
    assert!(args.contains(&"uuid"), "Missing --uuid flag");
    assert!(args.contains(&"status"), "Missing --status flag");
    // Should still have --params as escape hatch
    assert!(args.contains(&"params"), "Missing --params flag");
}

#[test]
fn test_snake_to_kebab() {
    assert_eq!(snake_to_kebab("min_start_time"), "min-start-time");
    assert_eq!(snake_to_kebab("uuid"), "uuid");
    assert_eq!(snake_to_kebab("page_token"), "page-token");
}
```

- [ ] **Step 5: Verify**

Run: `nix develop --command cargo test -- commands::tests`
Run: `nix develop --command cargo clippy -- -D warnings`

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: generate individual typed flags from OpenAPI parameters"
```

---

### Task 2: Collect individual flag values in `app.rs`

Bridge the gap between clap-parsed individual flags and the executor's `params_json` string.

**Files:**
- Modify: `src/app.rs`

- [ ] **Step 1: Add `collect_params_from_flags` function**

Add to `app.rs`:

```rust
use serde_json::{Map, Value};

/// Collect individual flag values into a params map.
/// Values from --params JSON override individual flags.
fn collect_params_from_flags(
    matched_args: &clap::ArgMatches,
    method: &crate::discovery::RestMethod,
    params_override: Option<&str>,
) -> Result<Map<String, Value>, CliError> {
    // Start with individual flags
    let mut params = Map::new();
    for (param_name, _param_def) in &method.parameters {
        if let Some(value) = matched_args.get_one::<String>(param_name) {
            params.insert(param_name.clone(), Value::String(value.clone()));
        }
    }

    // Override with --params JSON if provided
    if let Some(json_str) = params_override {
        let overrides: Map<String, Value> = serde_json::from_str(json_str)
            .map_err(|e| CliError::Validation(format!("Invalid --params JSON: {e}")))?;
        for (key, value) in overrides {
            params.insert(key, value);
        }
    }

    Ok(params)
}
```

- [ ] **Step 2: Update `run_async` to use `collect_params_from_flags`**

In `run_async`, after resolving the method, replace the direct `params_json` extraction with:

```rust
let params_override = matched_args.get_one::<String>("params").map(|s| s.as_str());
let params = collect_params_from_flags(matched_args, method, params_override)?;
let params_json_string = serde_json::to_string(&params)
    .map_err(|e| CliError::Validation(format!("Failed to serialize params: {e}")))?;
let params_json = if params.is_empty() { None } else { Some(params_json_string.as_str()) };
```

- [ ] **Step 3: Add tests**

```rust
#[test]
fn test_collect_params_from_flags_individual() {
    let mut params = std::collections::HashMap::new();
    params.insert("uuid".to_string(), crate::discovery::MethodParameter {
        param_type: Some("string".to_string()),
        location: Some("path".to_string()),
        required: true,
        ..Default::default()
    });

    let method = crate::discovery::RestMethod {
        parameters: params,
        ..Default::default()
    };

    let cmd = clap::Command::new("test")
        .arg(clap::Arg::new("uuid").long("uuid"))
        .arg(clap::Arg::new("params").long("params"));

    let matches = cmd.get_matches_from(vec!["test", "--uuid", "abc-123"]);
    let result = collect_params_from_flags(&matches, &method, None).unwrap();
    assert_eq!(result.get("uuid").unwrap().as_str().unwrap(), "abc-123");
}

#[test]
fn test_collect_params_override_wins() {
    let mut params = std::collections::HashMap::new();
    params.insert("uuid".to_string(), crate::discovery::MethodParameter::default());

    let method = crate::discovery::RestMethod {
        parameters: params,
        ..Default::default()
    };

    let cmd = clap::Command::new("test")
        .arg(clap::Arg::new("uuid").long("uuid"))
        .arg(clap::Arg::new("params").long("params"));

    let matches = cmd.get_matches_from(vec!["test", "--uuid", "from-flag", "--params", r#"{"uuid":"from-json"}"#]);
    let result = collect_params_from_flags(
        &matches,
        &method,
        matches.get_one::<String>("params").map(|s| s.as_str()),
    ).unwrap();
    // --params JSON should override the individual flag
    assert_eq!(result.get("uuid").unwrap().as_str().unwrap(), "from-json");
}
```

- [ ] **Step 4: Verify**

Run: `nix develop --command cargo test`
Run: `nix develop --command cargo clippy -- -D warnings`

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: collect individual flag values into params map with --params override"
```

---

### Task 3: Header parameter support

Parameters with `in: header` should be sent as HTTP headers.

**Files:**
- Modify: `src/executor.rs` (accept and send header params)
- Modify: `src/app.rs` (separate header params from path/query params)

- [ ] **Step 1: Add header params to `execute_method` signature**

Add a `headers: Option<&[(String, String)]>` parameter to `execute_method` and thread it into `build_http_request`. In `build_http_request`, add the headers to the request.

Alternatively, simpler approach: add `headers: Vec<(String, String)>` field to `ExecutionInput` and populate it in `parse_and_validate_inputs` by separating params with `location == "header"` from path/query params.

- [ ] **Step 2: Separate header params in `parse_and_validate_inputs`**

In the existing param validation loop, after checking for required params, separate header params:

```rust
let mut header_params: Vec<(String, String)> = Vec::new();
for (key, value) in &params {
    let is_header = method.parameters.get(key)
        .and_then(|p| p.location.as_deref())
        == Some("header");
    if is_header {
        if let Some(s) = value.as_str() {
            header_params.push((key.clone(), s.to_string()));
        }
    }
}
```

Add `header_params` to `ExecutionInput` struct and use them in `build_http_request`.

- [ ] **Step 3: Send header params in `build_http_request`**

After auth headers, add:
```rust
for (name, value) in &input.header_params {
    if let Ok(header_value) = reqwest::header::HeaderValue::from_str(value) {
        request = request.header(name.as_str(), header_value);
    }
}
```

- [ ] **Step 4: Add test**

```rust
#[test]
fn test_header_params_separated() {
    // Create a method with a header param and a query param
    // Verify header params end up in ExecutionInput.header_params
    // and don't appear in query_params
}
```

- [ ] **Step 5: Verify and commit**

```bash
nix develop --command cargo test
git add -A && git commit -m "feat: send header parameters as HTTP headers"
```

---

### Task 4: Query parameter serialization styles

Add `style`/`explode` fields to `MethodParameter` and serialize query params accordingly.

**Files:**
- Modify: `src/discovery.rs` (add style/explode fields)
- Modify: `src/openapi.rs` (parse style/explode from OpenAPI)
- Modify: `src/executor.rs` (serialize query params by style)

- [ ] **Step 1: Add fields to `MethodParameter`**

In `src/discovery.rs`:
```rust
pub struct MethodParameter {
    // ... existing fields ...
    /// OpenAPI serialization style (form, deepObject, etc.)
    #[serde(default)]
    pub style: Option<String>,
    /// Whether arrays/objects should be exploded into separate params.
    #[serde(default)]
    pub explode: Option<bool>,
}
```

- [ ] **Step 2: Parse style/explode in OpenAPI converter**

In `src/openapi.rs`, when converting parameters, read the `style` and `explode` fields from the OpenAPI parameter object. Add these fields to the `OpenApiParameter` struct and copy them to `MethodParameter`.

- [ ] **Step 3: Implement style-aware serialization in executor**

In `build_url` where query params are collected, check the style and serialize accordingly:

```rust
fn serialize_query_param(
    key: &str,
    value: &Value,
    param_def: Option<&MethodParameter>,
) -> Vec<(String, String)> {
    let style = param_def.and_then(|p| p.style.as_deref()).unwrap_or("form");
    let explode = param_def.and_then(|p| p.explode).unwrap_or(style == "form");

    match style {
        "deepObject" => {
            // filter[status]=active&filter[date]=2024-01-01
            if let Value::Object(map) = value {
                map.iter()
                    .map(|(k, v)| (format!("{key}[{k}]"), value_to_string(v)))
                    .collect()
            } else {
                vec![(key.to_string(), value_to_string(value))]
            }
        }
        "form" if explode && value.is_array() => {
            // tags=a&tags=b
            if let Value::Array(arr) = value {
                arr.iter().map(|v| (key.to_string(), value_to_string(v))).collect()
            } else {
                vec![(key.to_string(), value_to_string(value))]
            }
        }
        "form" if !explode && value.is_array() => {
            // tags=a,b
            if let Value::Array(arr) = value {
                let joined = arr.iter().map(value_to_string).collect::<Vec<_>>().join(",");
                vec![(key.to_string(), joined)]
            } else {
                vec![(key.to_string(), value_to_string(value))]
            }
        }
        _ => vec![(key.to_string(), value_to_string(value))],
    }
}

fn value_to_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => String::new(),
        other => other.to_string(),
    }
}
```

- [ ] **Step 4: Add tests for each style**

```rust
#[test]
fn test_deep_object_style() {
    // filter={"status":"active","date":"2024"} with deepObject
    // → filter[status]=active&filter[date]=2024
}

#[test]
fn test_form_explode_array() {
    // tags=["a","b"] with form+explode
    // → tags=a&tags=b
}

#[test]
fn test_form_no_explode_array() {
    // tags=["a","b"] with form+no explode
    // → tags=a,b
}
```

- [ ] **Step 5: Verify and commit**

```bash
nix develop --command cargo test
git add -A && git commit -m "feat: query parameter serialization styles (deepObject, form explode)"
```

---

### Task 5: Integration tests for typed flags

End-to-end tests using the actual CLI binary.

**Files:**
- Modify: `tests/cli_integration.rs`

- [ ] **Step 1: Add dry-run test with individual flags**

```rust
#[test]
fn test_dry_run_with_individual_flags() {
    let output = box_cmd()
        .args(["users", "get-user", "--uuid", "test-uuid-123", "--dry-run"])
        .output().unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("test-uuid-123") || stdout.contains("test%2Duuid%2D123"));
    assert!(stdout.contains("\"dry_run\": true"));
}

#[test]
fn test_dry_run_flags_with_enum() {
    let output = box_cmd()
        .args(["scheduled-events", "list-event-invitees",
               "--uuid", "event-123", "--status", "active", "--dry-run"])
        .output().unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("active"));
}

#[test]
fn test_params_override_wins_over_flags() {
    let output = box_cmd()
        .args(["users", "get-user",
               "--uuid", "from-flag",
               "--params", r#"{"uuid":"from-json"}"#,
               "--dry-run"])
        .output().unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    // --params should win
    assert!(stdout.contains("from-json") || stdout.contains("from%2Djson"));
}

#[test]
fn test_help_shows_parameter_flags() {
    let output = box_cmd()
        .args(["users", "get-user", "--help"])
        .output().unwrap();
    let combined = format!("{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr));
    assert!(combined.contains("--uuid"), "Help should show --uuid flag");
}
```

- [ ] **Step 2: Verify and commit**

```bash
nix develop --command cargo test --test cli_integration
git add -A && git commit -m "test: integration tests for typed flags and --params override"
```

---

### Task 6: Update ROADMAP_TRACKER.md and push

- [ ] **Step 1: Update tracker**

Mark items 1, 3, 6 as complete. Item 2 (dot-notation) is deferred to Plan B since it's about request body fields, not URL parameters.

- [ ] **Step 2: Final verification**

```bash
nix develop --command bash -c '
  cargo build &&
  cargo clippy -- -D warnings &&
  cargo test &&
  cargo run -- users get-user --uuid test-123 --dry-run &&
  cargo run -- users get-user --help &&
  cargo run -- scheduled-events list-scheduled-events --help
'
```

- [ ] **Step 3: Commit and push**

```bash
git add -A && git commit -m "docs: update roadmap tracker for Plan A completion"
git push origin main
```
