pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileWithQueryParamsRequest {
    pub file: Vec<u8>,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    pub integer: i64,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(rename = "listOfStrings")]
    pub list_of_strings: Vec<String>,
    #[serde(rename = "optionalListOfStrings")]
    pub optional_list_of_strings: Vec<Option<String>>,
}
impl JustFileWithQueryParamsRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Some(ref value) = self.maybe_string {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybeString", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.integer) {
            form = form.text("integer", json_str);
        }

        if let Some(ref value) = self.maybe_integer {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybeInteger", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.list_of_strings) {
            form = form.text("listOfStrings", json_str);
        }

        if let Ok(json_str) = serde_json::to_string(&self.optional_list_of_strings) {
            form = form.text("optionalListOfStrings", json_str);
        }

        form
    }
}
