//! Integration coverage for overlay application against the SDK template's
//! own dev fixture (`cli/openapi-fixture/openapi.yaml`).
//!
//! These previously lived inline in `src/openapi/overlay.rs`. They are
//! pure integration tests — they `include_str!` the dev fixture and exec
//! the full overlay → discovery pipeline — so they don't belong in unit
//! tests. They are filtered out of generated CLI output by `SDK_IGNORE`
//! in `generators/cli/build.mjs` because the fixture path doesn't ship.

use fern_cli_sdk::openapi::{apply_overlays_to_spec, load_openapi_spec};

#[test]
fn test_overlay_on_fixture_spec() {
    let spec = include_str!("../cli/openapi-fixture/openapi.yaml");
    let overlay = r#"
overlay: "1.0.0"
info:
  title: fixture-overlay
  version: "1.0.0"
actions:
  - target: "$.info"
    update:
      description: "Modified by overlay"
  - target: "$.paths['/users'].get"
    update:
      x-fern-sdk-method-name: listAllUsers
  - target: "$.paths['/users'].get.parameters"
    update:
      name: offset
      in: query
      schema:
        type: integer
  - target: "$.paths['/files/{file_id}/thumbnail']"
    remove: true
"#;
    let result = apply_overlays_to_spec(spec, &[overlay.to_string()]).unwrap();
    let doc: serde_json::Value = serde_yaml::from_str(&result).unwrap();

    // Verify info.description was set
    assert_eq!(doc["info"]["description"], "Modified by overlay");

    // Verify method rename
    assert_eq!(
        doc["paths"]["/users"]["get"]["x-fern-sdk-method-name"],
        "listAllUsers"
    );

    // Verify array append (new parameter added)
    let params = doc["paths"]["/users"]["get"]["parameters"]
        .as_array()
        .unwrap();
    let has_offset = params.iter().any(|p| p["name"] == "offset");
    assert!(has_offset, "offset param should be appended: {params:?}");

    // Verify remove
    assert!(
        doc["paths"]["/files/{file_id}/thumbnail"].is_null(),
        "thumbnail path should be removed"
    );

    // Verify untouched paths still exist
    assert!(
        !doc["paths"]["/files/{file_id}"].is_null(),
        "other file paths should remain"
    );
}

#[test]
fn test_overlay_then_load_openapi_spec_finds_resources() {
    let spec = include_str!("../cli/openapi-fixture/openapi.yaml");
    let overlay = r#"
overlay: "1.0.0"
info:
  title: fixture-overlay
  version: "1.0.0"
actions:
  - target: "$.paths['/files/{file_id}/thumbnail']"
    remove: true
"#;

    let merged = apply_overlays_to_spec(spec, &[overlay.to_string()]).unwrap();
    let doc = load_openapi_spec(&merged, "overlay-fixture").unwrap();

    // files, folders, and users groups should still exist
    assert!(doc.resources.contains_key("files"), "files group missing");
    assert!(doc.resources.contains_key("folders"), "folders group missing");
    assert!(doc.resources.contains_key("users"), "users group missing");

    // getThumbnail should be gone from the files resource
    let files = &doc.resources["files"];
    assert!(
        !files.methods.contains_key("getThumbnail"),
        "getThumbnail should be removed: {:?}",
        files.methods.keys().collect::<Vec<_>>()
    );
    // Other file operations should still exist
    assert!(
        files.methods.contains_key("get"),
        "get should remain: {:?}",
        files.methods.keys().collect::<Vec<_>>()
    );
    assert!(
        files.methods.contains_key("update"),
        "update should remain: {:?}",
        files.methods.keys().collect::<Vec<_>>()
    );
}
