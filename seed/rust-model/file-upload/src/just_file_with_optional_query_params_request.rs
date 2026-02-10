pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileWithOptionalQueryParamsRequest {
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
}
impl JustFileWithOptionalQueryParamsRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    if let Some(ref value) = self.maybe_string {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("maybeString", json_str);
        }
    }

    if let Some(ref value) = self.maybe_integer {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("maybeInteger", json_str);
        }
    }

    form
}
}