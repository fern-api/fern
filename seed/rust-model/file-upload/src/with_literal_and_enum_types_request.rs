pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithLiteralAndEnumTypesRequest {
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_type: Option<ModelType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub open_enum: Option<OpenEnumType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_name: Option<String>,
}
impl WithLiteralAndEnumTypesRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    if let Some(ref value) = self.model_type {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("model_type", json_str);
        }
    }

    if let Some(ref value) = self.open_enum {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("open_enum", json_str);
        }
    }

    if let Some(ref value) = self.maybe_name {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("maybe_name", json_str);
        }
    }

    form
}
}