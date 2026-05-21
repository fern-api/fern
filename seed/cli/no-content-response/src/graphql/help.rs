//! JSON help output — renders `--help --format json` as a machine-readable
//! schema. When an agent passes both `--help` (or `-h`) and `--format json`,
//! `app.rs` intercepts before clap parses and calls [`render_json_help`].

use serde_json::{json, Map, Value};

use crate::error::CliError;
use crate::graphql::discovery::{GraphQLOperation, GraphQLResource, GraphQLSchema};

/// Renders JSON help for the given subcommand path and prints it to stdout.
pub fn render_json_help(doc: &GraphQLSchema, path: &[String]) -> Result<(), CliError> {
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

fn list_all_operations(doc: &GraphQLSchema) -> Value {
    let mut ops: Vec<Value> = Vec::new();
    let mut names: Vec<_> = doc.resources.keys().collect();
    names.sort();
    for name in names {
        collect_resource_ops(&doc.resources[name], &[name], &mut ops);
    }
    json!(ops)
}

fn list_resource_operations(doc: &GraphQLSchema, resource: &str) -> Result<Value, CliError> {
    let res = doc
        .resources
        .get(resource)
        .ok_or_else(|| CliError::Validation(format!("Resource not found: {resource}")))?;
    let mut ops: Vec<Value> = Vec::new();
    collect_resource_ops(res, &[resource], &mut ops);
    Ok(json!(ops))
}

fn list_nested_resource_operations(doc: &GraphQLSchema, path: &[&str]) -> Result<Value, CliError> {
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

fn operation_schema(doc: &GraphQLSchema, resource_path: &[&str], method_name: &str) -> Result<Value, CliError> {
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

fn build_schema(resource_path: &[&str], method_name: &str, method: &GraphQLOperation) -> Value {
    let mut properties: Map<String, Value> = Map::new();
    let mut required: Vec<String> = Vec::new();

    let mut param_names: Vec<_> = method.parameters.keys().collect();
    param_names.sort();
    for name in param_names {
        let param = &method.parameters[name];
        let mut prop = json!({
            "type": param.param_type.as_deref().unwrap_or("string"),
            "description": param.description.as_deref().unwrap_or(""),
        });
        if let Some(enums) = &param.enum_values {
            prop["enum"] = json!(enums);
        }
        if param.required {
            required.push(name.clone());
        }
        properties.insert(name.clone(), prop);
    }
    required.sort();

    let (operation_type, field) = method
        .graphql
        .as_ref()
        .map(|g| (g.operation_type.as_str(), g.field_name.as_str()))
        .unwrap_or(("query", ""));

    json!({
        "operation": format!("{}.{}", resource_path.join("."), method_name),
        "operationType": operation_type,
        "field": field,
        "description": method.description.as_deref().unwrap_or(""),
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": required,
        },
    })
}

fn collect_resource_ops(res: &GraphQLResource, path: &[&str], ops: &mut Vec<Value>) {
    let mut method_names: Vec<_> = res.methods.keys().collect();
    method_names.sort();
    for method_name in method_names {
        let m = &res.methods[method_name];
        let (operation_type, field) = m
            .graphql
            .as_ref()
            .map(|g| (g.operation_type.as_str(), g.field_name.as_str()))
            .unwrap_or(("query", ""));
        ops.push(json!({
            "operation": format!("{}.{}", path.join("."), method_name),
            "operationType": operation_type,
            "field": field,
            "description": m.description.as_deref().unwrap_or(""),
        }));
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
    use crate::graphql::discovery::{MethodParameter, GraphQLOperation, GraphQLResource};
    use std::collections::HashMap;

    fn make_doc() -> GraphQLSchema {
        use crate::graphql::discovery::GraphQLMethodInfo;

        let mut params = HashMap::new();
        params.insert(
            "user_id".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("The user ID".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let mut methods = HashMap::new();
        methods.insert(
            "get".to_string(),
            GraphQLOperation {
                description: Some("Get a user".to_string()),
                parameters: params,
                graphql: Some(GraphQLMethodInfo {
                    operation_type: "query".to_string(),
                    field_name: "user".to_string(),
                    default_selection: "{ id name }".to_string(),
                    args: Vec::new(),
                }),
                ..Default::default()
            },
        );
        let mut resources = HashMap::new();
        resources.insert(
            "users".to_string(),
            GraphQLResource {
                methods,
                resources: HashMap::new(),
            },
        );
        GraphQLSchema {
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
        assert_eq!(schema["operationType"], "query");
        assert_eq!(schema["field"], "user");
        let required = schema["parameters"]["required"].as_array().unwrap();
        assert!(required.iter().any(|v| v == "user_id"));
    }

    #[test]
    fn test_render_json_help_nested_sub_resource_listing() {
        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::graphql::discovery::GraphQLOperation::default(),
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            GraphQLResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            GraphQLResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = GraphQLSchema {
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
        use crate::graphql::discovery::GraphQLMethodInfo;

        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::graphql::discovery::GraphQLOperation {
                description: Some("Get a membership".to_string()),
                graphql: Some(GraphQLMethodInfo {
                    operation_type: "query".to_string(),
                    field_name: "membership".to_string(),
                    default_selection: "{ id }".to_string(),
                    args: Vec::new(),
                }),
                ..Default::default()
            },
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            GraphQLResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            GraphQLResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = GraphQLSchema {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let schema = operation_schema(&doc, &["organizations", "memberships"], "get-membership").unwrap();
        assert_eq!(schema["operation"], "organizations.memberships.get-membership");
        assert_eq!(schema["operationType"], "query");
        assert_eq!(schema["field"], "membership");
    }

    #[test]
    fn test_render_json_help_dispatches_nested_path() {
        let mut nested_methods = std::collections::HashMap::new();
        nested_methods.insert(
            "get-membership".to_string(),
            crate::graphql::discovery::GraphQLOperation::default(),
        );
        let mut sub_resources = std::collections::HashMap::new();
        sub_resources.insert(
            "memberships".to_string(),
            GraphQLResource {
                methods: nested_methods,
                resources: std::collections::HashMap::new(),
            },
        );
        let mut resources = std::collections::HashMap::new();
        resources.insert(
            "organizations".to_string(),
            GraphQLResource {
                methods: std::collections::HashMap::new(),
                resources: sub_resources,
            },
        );
        let doc = GraphQLSchema {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let path: Vec<String> = vec!["organizations".into(), "memberships".into(), "get-membership".into()];
        let result = render_json_help(&doc, &path);
        assert!(result.is_ok(), "nested path should resolve correctly");
    }
}
