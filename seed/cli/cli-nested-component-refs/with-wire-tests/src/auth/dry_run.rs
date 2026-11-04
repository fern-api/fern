//! The `auth` block of a `--dry-run` preview.
//!
//! Reports which scheme(s) the endpoint accepts and whether the CLI would
//! attach credentials, without ever touching the credential values.

use serde_json::{json, Value};

use crate::auth::error::dedup_preserve_order;
use crate::auth::{AuthProvider, EndpointAuthMetadata};

/// `declared` is the endpoint's own security policy; `effective` is the same
/// policy with the schemes the caller already supplied as explicit
/// header/query parameters removed (same length, same order).
///
/// Requirements are walked in spec order, mirroring
/// [`RoutingAuthProvider::apply`](crate::auth::RoutingAuthProvider): the
/// first one the provider can satisfy decides. `credentials` is one of:
/// - `"not_required"` — `security: []`, an anonymous alternative is the
///   first satisfiable one, or nothing is declared and the CLI has no
///   credential sources to draw from;
/// - `"supplied"` — the caller passed the credential as a request parameter;
/// - `"resolved"` — the provider holds credentials for `satisfied_by`.
///   `configured_sources` lists every populated source the provider knows
///   about (the `AuthProvider` API cannot scope hints to one requirement);
/// - `"missing"` — nothing satisfiable (`expected_sources` lists where to set
///   them).
pub(crate) fn dry_run_auth_info(
    provider: &dyn AuthProvider,
    declared: &EndpointAuthMetadata,
    effective: &EndpointAuthMetadata,
) -> Value {
    let schemes: Option<Vec<String>> = declared
        .security_requirements
        .as_ref()
        .map(|reqs| reqs.iter().map(requirement_label).collect());
    let mut info = json!({ "schemes": schemes });

    let (Some(declared_reqs), Some(effective_reqs)) = (
        &declared.security_requirements,
        &effective.security_requirements,
    ) else {
        if provider.has_credentials_for(effective) {
            resolved(&mut info, provider, None);
        } else {
            missing(&mut info, provider, false);
        }
        return info;
    };
    if declared_reqs.is_empty() {
        info["credentials"] = json!("not_required");
        return info;
    }

    for (declared_req, effective_req) in declared_reqs.iter().zip(effective_reqs) {
        if effective_req.is_empty() {
            if declared_req.is_empty() {
                info["credentials"] = json!("not_required");
            } else {
                info["credentials"] = json!("supplied");
                info["satisfied_by"] = json!(requirement_label(declared_req));
            }
            return info;
        }
        let single = EndpointAuthMetadata {
            security_requirements: Some(vec![effective_req.clone()]),
            base_url_override: effective.base_url_override.clone(),
        };
        if provider.has_credentials_for(&single) {
            resolved(&mut info, provider, Some(requirement_label(declared_req)));
            return info;
        }
    }
    missing(&mut info, provider, true);
    info
}

fn resolved(info: &mut Value, provider: &dyn AuthProvider, satisfied_by: Option<String>) {
    info["credentials"] = json!("resolved");
    if let Some(label) = satisfied_by {
        info["satisfied_by"] = json!(label);
    }
    info["configured_sources"] = json!(dedup_preserve_order(provider.populated_credential_hints()));
}

fn missing(info: &mut Value, provider: &dyn AuthProvider, requires_auth: bool) {
    let expected = dedup_preserve_order(provider.credential_hints());
    if requires_auth || !expected.is_empty() {
        info["credentials"] = json!("missing");
        info["expected_sources"] = json!(expected);
    } else {
        info["credentials"] = json!("not_required");
    }
}

/// `"A + B"` for an AND requirement, sorted for stable output.
fn requirement_label(req: &std::collections::HashMap<String, Vec<String>>) -> String {
    let mut names: Vec<&str> = req.keys().map(String::as_str).collect();
    names.sort_unstable();
    names.join(" + ")
}
