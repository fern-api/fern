//! JSON help output — renders `--help --format json` as a machine-readable
//! schema. When an agent passes both `--help` (or `-h`) and `--format json`,
//! `app.rs` intercepts before clap parses and calls [`render_json_help`].

use serde_json::{json, Map, Value};

use crate::error::CliError;
use crate::openapi::discovery::{RestDescription, RestMethod, RestResource};

/// Renders JSON help for the given subcommand path and prints it to stdout.
pub fn render_json_help(doc: &RestDescription, path: &[String]) -> Result<(), CliError> {
    let output = match path.len() {
        0 => list_all_operations(doc),
        1 => list_resource_operations(doc, &path[0])?,
        _ => {
            // Try treating last element as a method name first.
            // If that fails, the full path may resolve to a nested sub-resource — list its ops.
            let resource_path: Vec<&str> = path[..path.len() - 1].iter().map(|s| s.as_str()).collect();
            let method_name = path[path.len() - 1].as_str();
            match operation_schema(doc, &resource_path, method_name) {
                Ok(schema) => schema,
                Err(_) => {
                    let full_path: Vec<&str> = path.iter().map(|s| s.as_str()).collect();
                    list_nested_resource_operations(doc, &full_path)?
                }
            }
        }
    };

    println!(
        "{}",
        serde_json::to_string_pretty(&output)
            .map_err(|e| CliError::Validation(format!("Failed to serialize help: {e}")))?
    );
    Ok(())
}

fn list_all_operations(doc: &RestDescription) -> Value {
    let mut ops: Vec<Value> = Vec::new();
    let mut names: Vec<_> = doc.resources.keys().collect();
    names.sort();
    for name in names {
        collect_resource_ops(&doc.resources[name], &[name], &mut ops);
    }
    // Wrap the operations list in a top-level object that also exposes any
    // `x-fern-sdk-variables` so a machine consumer can discover the global
    // root flags (and their env-var fallbacks) without inspecting every
    // operation. Falls back to the bare array when no variables are
    // declared so existing consumers that expect a JSON array at the root
    // are unaffected.
    if doc.sdk_variables.is_empty() {
        json!(ops)
    } else {
        json!({
            "sdkVariables": render_sdk_variables(&doc.sdk_variables),
            "operations": ops,
        })
    }
}

fn render_sdk_variables(
    vars: &[crate::openapi::discovery::SdkVariable],
) -> Vec<Value> {
    vars.iter()
        .map(|v| {
            json!({
                "name": v.name,
                "type": v.ty,
                "description": v.description.as_deref().unwrap_or(""),
                "globalFlag": format!("--{}", crate::text::to_kebab_flag(&v.name)),
                "envVar": crate::text::to_screaming_snake(&v.name),
            })
        })
        .collect()
}

fn list_resource_operations(doc: &RestDescription, resource: &str) -> Result<Value, CliError> {
    let res = doc
        .resources
        .get(resource)
        .ok_or_else(|| CliError::Validation(format!("Resource not found: {resource}")))?;
    let mut ops: Vec<Value> = Vec::new();
    collect_resource_ops(res, &[resource], &mut ops);
    Ok(json!(ops))
}

fn list_nested_resource_operations(doc: &RestDescription, path: &[&str]) -> Result<Value, CliError> {
    let first = path.first().ok_or_else(|| {
        CliError::Validation("No resource specified".to_string())
    })?;
    let mut res = doc
        .resources
        .get(*first)
        .ok_or_else(|| CliError::Validation(format!("Resource not found: {first}")))?;
    for segment in &path[1..] {
        res = res
            .resources
            .get(*segment)
            .ok_or_else(|| CliError::Validation(format!("Resource not found: {segment}")))?;
    }
    let mut ops: Vec<Value> = Vec::new();
    collect_resource_ops(res, path, &mut ops);
    Ok(json!(ops))
}

fn operation_schema(doc: &RestDescription, resource_path: &[&str], method_name: &str) -> Result<Value, CliError> {
    let first = resource_path.first().ok_or_else(|| {
        CliError::Validation("No resource specified".to_string())
    })?;

    let mut res = doc
        .resources
        .get(*first)
        .ok_or_else(|| CliError::Validation(format!("Resource not found: {first}")))?;

    for segment in &resource_path[1..] {
        res = res
            .resources
            .get(*segment)
            .ok_or_else(|| CliError::Validation(format!("Resource not found: {segment}")))?;
    }

    let method = res.methods.get(method_name).ok_or_else(|| {
        CliError::Validation(format!(
            "Operation not found: {} {method_name}",
            resource_path.join(" ")
        ))
    })?;

    Ok(build_schema(resource_path, method_name, method))
}

fn build_schema(resource_path: &[&str], method_name: &str, method: &RestMethod) -> Value {
    let mut properties: Map<String, Value> = Map::new();
    let mut required: Vec<String> = Vec::new();

    let mut param_names: Vec<_> = method.parameters.keys().collect();
    param_names.sort();
    for name in param_names {
        let param = &method.parameters[name];
        let mut prop = json!({
            "type": param.param_type.as_deref().unwrap_or("string"),
            "description": param.description.as_deref().unwrap_or(""),
            "location": param.location.as_deref().unwrap_or("query"),
        });
        if let Some(enums) = &param.enum_values {
            prop["enum"] = json!(enums);
            // When `x-fern-enum` overrides are present, expose the
            // per-value display name and description so JSON-help
            // consumers can render them without reparsing the spec.
            if let Some(fern_enum) = &param.fern_enum {
                let mut by_wire: Map<String, Value> = Map::new();
                for wire in enums {
                    if let Some(entry) = fern_enum.get(wire) {
                        let mut obj = Map::new();
                        if let Some(name) = &entry.display_name {
                            obj.insert("name".to_string(), Value::String(name.clone()));
                        }
                        if let Some(desc) = &entry.description {
                            obj.insert("description".to_string(), Value::String(desc.clone()));
                        }
                        if !obj.is_empty() {
                            by_wire.insert(wire.clone(), Value::Object(obj));
                        }
                    }
                }
                if !by_wire.is_empty() {
                    prop["x-fern-enum"] = Value::Object(by_wire);
                }
            }
        }
        if let Some(availability) = param.availability {
            prop["availability"] = json!(availability.as_str());
        }
        // Variable-bound path parameters are NOT per-op required flags; their
        // value comes from the root-level global flag (kebab-cased) with an
        // env-var fallback (SCREAMING_SNAKE_CASE), or from `--params` JSON.
        // Mark them explicitly so machine consumers (LLM agents, code
        // generators) know not to surface a per-op `--<param>` flag and can
        // discover the right global/env fallbacks instead.
        if let Some(var_name) = param.variable_reference.as_deref() {
            prop["binding"] = json!("sdk-variable");
            prop["variable"] = json!(var_name);
            prop["globalFlag"] = json!(format!("--{}", crate::text::to_kebab_flag(var_name)));
            prop["envVar"] = json!(crate::text::to_screaming_snake(var_name));
        } else if param.required {
            required.push(name.clone());
        }
        properties.insert(name.clone(), prop);
    }
    required.sort();

    let mut output = json!({
        "operation": format!("{}.{}", resource_path.join("."), method_name),
        "httpMethod": method.http_method,
        "path": method.path,
        "description": method.description.as_deref().unwrap_or(""),
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": required,
        },
    });
    if let Some(availability) = method.availability {
        output["availability"] = json!(availability.as_str());
    }
    output
}

fn collect_resource_ops(res: &RestResource, path: &[&str], ops: &mut Vec<Value>) {
    let mut method_names: Vec<_> = res.methods.keys().collect();
    method_names.sort();
    for method_name in method_names {
        let m = &res.methods[method_name];
        let mut entry = json!({
            "operation": format!("{}.{}", path.join("."), method_name),
            "httpMethod": m.http_method,
            "path": m.path,
            "description": m.description.as_deref().unwrap_or(""),
        });
        if let Some(availability) = m.availability {
            entry["availability"] = json!(availability.as_str());
        }
        ops.push(entry);
    }
    let mut sub_names: Vec<_> = res.resources.keys().collect();
    sub_names.sort();
    for sub_name in sub_names {
        let mut sub_path = path.to_vec();
        sub_path.push(sub_name);
        collect_resource_ops(&res.resources[sub_name], &sub_path, ops);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::openapi::discovery::{MethodParameter, RestMethod, RestResource};
    use std::collections::HashMap;

    fn make_doc() -> RestDescription {
        let mut params = HashMap::new();
        params.insert(
            "user_id".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("The user ID".to_string()),
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let mut methods = HashMap::new();
        methods.insert(
            "get".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/users/{user_id}".to_string(),
                description: Some("Get a user".to_string()),
                parameters: params,
                ..Default::default()
            },
        );
        let mut resources = HashMap::new();
        resources.insert(
            "users".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );
        RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        }
    }

    #[test]
    fn test_render_root_lists_all() {
        let doc = make_doc();
        let output = list_all_operations(&doc);
        let arr = output.as_array().unwrap();
        assert!(!arr.is_empty());
        assert_eq!(arr[0]["operation"], "users.get");
    }

    #[test]
    fn test_render_resource() {
        let doc = make_doc();
        let output = list_resource_operations(&doc, "users").unwrap();
        let arr = output.as_array().unwrap();
        assert_eq!(arr.len(), 1);
        assert_eq!(arr[0]["operation"], "users.get");
    }

    #[test]
    fn test_render_operation_schema() {
        let doc = make_doc();
        let schema = operation_schema(&doc, &["users"], "get").unwrap();
        assert_eq!(schema["httpMethod"], "GET");
        let required = schema["parameters"]["required"].as_array().unwrap();
        assert!(required.iter().any(|v| v == "user_id"));
    }

    #[test]
    fn test_variable_bound_param_annotated_and_not_required_in_per_op_schema() {
        // JSON help is the machine-readable contract for LLM agents. A
        // variable-bound path parameter must NOT appear in the per-op
        // `required` array (there is no per-op flag for it), and the
        // property MUST carry enough metadata for an agent to resolve it
        // via the root-level global flag, env var, or --params JSON.
        let mut params = HashMap::new();
        params.insert(
            "gardenId".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Tenant id".to_string()),
                location: Some("path".to_string()),
                required: true,
                variable_reference: Some("gardenId".to_string()),
                ..Default::default()
            },
        );
        // A plain (non-variable-bound) required path param on the same op
        // MUST still show up in `required` as before.
        params.insert(
            "zoneId".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Zone id".to_string()),
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "/gardens/{gardenId}/zones/{zoneId}".to_string(),
            description: Some("List zones".to_string()),
            parameters: params,
            ..Default::default()
        };
        let schema = build_schema(&["zones"], "get", &method);
        let required = schema["parameters"]["required"].as_array().unwrap();
        assert!(
            !required.iter().any(|v| v == "gardenId"),
            "variable-bound param must not appear in per-op `required`, got: {required:?}",
        );
        assert!(
            required.iter().any(|v| v == "zoneId"),
            "plain required path param must still be in `required`, got: {required:?}",
        );

        let garden = &schema["parameters"]["properties"]["gardenId"];
        assert_eq!(garden["binding"], "sdk-variable");
        assert_eq!(garden["variable"], "gardenId");
        assert_eq!(garden["globalFlag"], "--garden-id");
        assert_eq!(garden["envVar"], "GARDEN_ID");
    }

    #[test]
    fn test_root_listing_surfaces_sdk_variables_when_declared() {
        // With at least one `x-fern-sdk-variables` entry the root JSON
        // help wraps the operations array in an object that exposes the
        // variable definitions (name, type, description, derived flag,
        // env var) so machine consumers can discover the root-level
        // globals without scanning every operation.
        let mut doc = make_doc();
        doc.sdk_variables = vec![crate::openapi::discovery::SdkVariable {
            name: "gardenId".to_string(),
            ty: "string".to_string(),
            description: Some("Tenant id".to_string()),
        }];
        let output = list_all_operations(&doc);
        let obj = output.as_object().expect("expected wrapped object when sdk_variables present");
        let vars = obj["sdkVariables"].as_array().unwrap();
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0]["name"], "gardenId");
        assert_eq!(vars[0]["globalFlag"], "--garden-id");
        assert_eq!(vars[0]["envVar"], "GARDEN_ID");
        assert_eq!(vars[0]["description"], "Tenant id");
        assert!(
            obj["operations"].as_array().unwrap().iter().any(|op| op["operation"] == "users.get"),
            "operations array must still list every op when wrapped",
        );
    }

    #[test]
    fn test_root_listing_stays_bare_array_when_no_sdk_variables() {
        // Backwards-compat: specs without any `x-fern-sdk-variables`
        // still produce a top-level JSON array (the shape every
        // existing consumer expects).
        let doc = make_doc();
        let output = list_all_operations(&doc);
        assert!(
            output.is_array(),
            "root JSON help must stay a bare array when no sdk_variables are declared",
        );
    }

    #[test]
    fn test_render_json_help_nested_sub_resource_listing() {
        // path.len() == 2 where last element is a sub-resource, not a method
        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::openapi::discovery::RestMethod {
                http_method: "GET".to_string(),
                path: "/organizations/{id}/memberships/{mid}".to_string(),
                ..Default::default()
            },
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            RestResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            RestResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let path: Vec<String> = vec!["organizations".into(), "memberships".into()];
        let result = render_json_help(&doc, &path);
        assert!(result.is_ok(), "sub-resource path should list operations, not error");
    }

    #[test]
    fn test_render_nested_operation_schema() {
        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::openapi::discovery::RestMethod {
                http_method: "GET".to_string(),
                path: "/organizations/{org_id}/memberships/{membership_id}".to_string(),
                description: Some("Get a membership".to_string()),
                ..Default::default()
            },
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            RestResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            RestResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let schema = operation_schema(&doc, &["organizations", "memberships"], "get-membership").unwrap();
        assert_eq!(schema["operation"], "organizations.memberships.get-membership");
        assert_eq!(schema["httpMethod"], "GET");
    }

    #[test]
    fn test_render_json_help_dispatches_nested_path() {
        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::openapi::discovery::RestMethod {
                http_method: "GET".to_string(),
                path: "/orgs/{id}/memberships/{mid}".to_string(),
                ..Default::default()
            },
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            RestResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            RestResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let path: Vec<String> = vec!["organizations".into(), "memberships".into(), "get-membership".into()];
        // Should not error — previously would pass "memberships" as method name
        let result = render_json_help(&doc, &path);
        assert!(result.is_ok(), "nested path should resolve correctly");
    }
}
