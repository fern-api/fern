/// Strip a GraphQL introspection JSON file for embedding in a CLI binary.
///
/// Removes bloat that the parser never reads:
///   1. Built-in meta-types (`__Schema`, `__Type`, etc.)
///   2. `deprecationReason` (human-readable deprecation message — not used)
///   3. `directives` array (not used by the CLI generator)
///
/// Kept intentionally:
///   - `description` — powers `--help` text for flags and commands
///   - `isDeprecated` — wired to `MethodParameter.deprecated`
///   - `defaultValue` — wired to `MethodParameter.default` (clap default values)
///
/// Usage:
///   cargo run --bin strip-schema -- path/to/schema.json > src/bin/myapi/schema.json
///   cat schema.json | cargo run --bin strip-schema > src/bin/myapi/schema.json
use serde_json::Value;
use std::{env, fs, io::{self, Read}};

fn main() {
    let input = match env::args().nth(1) {
        Some(path) => fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("Cannot read {path}: {e}")),
        None => {
            let mut buf = String::new();
            io::stdin().read_to_string(&mut buf).expect("Failed to read stdin");
            buf
        }
    };

    let mut data: Value = serde_json::from_str(&input).expect("Invalid JSON");

    // Support both wrapped (`data.__schema`) and bare (`__schema`) responses.
    let schema = if data.get("data").is_some() {
        &mut data["data"]["__schema"]
    } else {
        &mut data["__schema"]
    };

    // Drop directives — not used by the CLI generator.
    if let Value::Object(map) = schema {
        map.remove("directives");
    }

    if let Some(types) = schema.get_mut("types").and_then(|t| t.as_array_mut()) {
        // Remove built-in meta-types.
        types.retain(|t| {
            t.get("name")
                .and_then(|n| n.as_str())
                .map(|n| !n.starts_with("__"))
                .unwrap_or(true)
        });
    }

    strip_noise(&mut data);

    println!("{}", serde_json::to_string(&data).expect("Serialization failed"));

    let original_kb = input.len() / 1024;
    let stripped_kb = serde_json::to_string(&data).unwrap().len() / 1024;
    let reduction = if original_kb > 0 {
        (1.0 - stripped_kb as f64 / original_kb as f64) * 100.0
    } else {
        0.0
    };
    eprintln!("Stripped {original_kb} KB → {stripped_kb} KB ({reduction:.0}% reduction)");
}

/// Remove fields the parser never reads. Keeps descriptions, isDeprecated, and defaultValue.
fn strip_noise(val: &mut Value) {
    match val {
        Value::Object(map) => {
            map.remove("deprecationReason");
            for v in map.values_mut() {
                strip_noise(v);
            }
        }
        Value::Array(arr) => {
            for v in arr.iter_mut() {
                strip_noise(v);
            }
        }
        _ => {}
    }
}
