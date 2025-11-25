pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PostRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    pub integer: i64,
    pub file: Vec<u8>,
    pub file_list: Vec<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_file_list: Option<Vec<Vec<u8>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list_of_strings: Option<Vec<String>>,
    pub list_of_objects: Vec<MyObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_metadata: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object_type: Option<ObjectType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_id: Option<Id>,
    pub alias_object: MyAliasObject,
    pub list_of_alias_object: Vec<MyAliasObject>,
    pub alias_list_of_object: MyCollectionAliasObject,
}
impl PostRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        for file_data in &self.file_list {
            form = form.part(
                "file_list",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file_list")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref file_data) = self.maybe_file {
            form = form.part(
                "maybe_file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("maybe_file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref files) = self.maybe_file_list {
            for file_data in files {
                form = form.part(
                    "maybe_file_list",
                    reqwest::multipart::Part::bytes(file_data.clone())
                        .file_name("maybe_file_list")
                        .mime_str("application/octet-stream")
                        .unwrap(),
                );
            }
        }

        if let Some(ref value) = self.maybe_string {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybe_string", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.integer) {
            form = form.text("integer", json_str);
        }

        if let Some(ref value) = self.maybe_integer {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybe_integer", json_str);
            }
        }

        if let Some(ref value) = self.optional_list_of_strings {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("optional_list_of_strings", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.list_of_objects) {
            form = form.text("list_of_objects", json_str);
        }

        if let Some(ref value) = self.optional_metadata {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("optional_metadata", json_str);
            }
        }

        if let Some(ref value) = self.optional_object_type {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("optional_object_type", json_str);
            }
        }

        if let Some(ref value) = self.optional_id {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("optional_id", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.alias_object) {
            form = form.text("alias_object", json_str);
        }

        if let Ok(json_str) = serde_json::to_string(&self.list_of_alias_object) {
            form = form.text("list_of_alias_object", json_str);
        }

        if let Ok(json_str) = serde_json::to_string(&self.alias_list_of_object) {
            form = form.text("alias_list_of_object", json_str);
        }

        form
    }
}
