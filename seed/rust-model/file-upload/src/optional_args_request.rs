pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct OptionalArgsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request: Option<serde_json::Value>,
}
impl OptionalArgsRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    if let Some(ref file_data) = self.image_file {
        form = form.part(
            "image_file",
            reqwest::multipart::Part::bytes(file_data.clone())
                .file_name("image_file")
                .mime_str("application/octet-stream").unwrap()
        );
    }

    if let Some(ref value) = self.request {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("request", json_str);
        }
    }

    form
}
}