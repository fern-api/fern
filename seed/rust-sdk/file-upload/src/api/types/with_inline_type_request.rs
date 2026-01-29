pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithInlineTypeRequest {
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    pub request: MyInlineType,
}
impl WithInlineTypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    if let Ok(json_str) = serde_json::to_string(&self.request) {
        form = form.text("request", json_str);
    }

    form
}
}