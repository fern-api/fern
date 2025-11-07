pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithContentTypeRequest {
    pub file: Vec<u8>,
    pub foo: String,
    pub bar: MyObject,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo_bar: Option<MyObject>,
}
impl WithContentTypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Ok(json_str) = serde_json::to_string(&self.foo) {
            form = form.text("foo", json_str);
        }

        if let Ok(json_str) = serde_json::to_string(&self.bar) {
            form = form.text("bar", json_str);
        }

        if let Some(ref value) = self.foo_bar {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("foo_bar", json_str);
            }
        }

        form
    }
}
