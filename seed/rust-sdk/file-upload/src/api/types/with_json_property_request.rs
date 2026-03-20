pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithJsonPropertyRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub json: Option<MyObject>,
}
impl WithJsonPropertyRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Some(ref value) = self.json {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("json", json_str);
            }
        }

        form
    }
}
