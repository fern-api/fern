pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PostRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file_list: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub maybe_file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub maybe_file_list: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list_of_strings: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list_of_objects: Option<Vec<MyObject>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_metadata: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object_type: Option<ObjectType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_id: Option<Id>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_object: Option<MyAliasObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list_of_alias_object: Option<Vec<MyAliasObject>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_list_of_object: Option<MyCollectionAliasObject>,
}
impl PostRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Some(ref file_data) = self.file {
            form = form.part(
                "file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref file_data) = self.file_list {
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

        if let Some(ref file_data) = self.maybe_file_list {
            form = form.part(
                "maybe_file_list",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("maybe_file_list")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref value) = self.maybe_string {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybe_string", json_str);
            }
        }

        if let Some(ref value) = self.integer {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("integer", json_str);
            }
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

        if let Some(ref value) = self.list_of_objects {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("list_of_objects", json_str);
            }
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

        if let Some(ref value) = self.alias_object {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("alias_object", json_str);
            }
        }

        if let Some(ref value) = self.list_of_alias_object {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("list_of_alias_object", json_str);
            }
        }

        if let Some(ref value) = self.alias_list_of_object {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("alias_list_of_object", json_str);
            }
        }

        form
    }
}

impl PostRequest {
    pub fn builder() -> PostRequestBuilder {
        <PostRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PostRequestBuilder {
    maybe_string: Option<String>,
    integer: Option<i64>,
    file: Option<Vec<u8>>,
    file_list: Option<Vec<u8>>,
    maybe_file: Option<Vec<u8>>,
    maybe_file_list: Option<Vec<u8>>,
    maybe_integer: Option<i64>,
    optional_list_of_strings: Option<Vec<String>>,
    list_of_objects: Option<Vec<MyObject>>,
    optional_metadata: Option<serde_json::Value>,
    optional_object_type: Option<ObjectType>,
    optional_id: Option<Id>,
    alias_object: Option<MyAliasObject>,
    list_of_alias_object: Option<Vec<MyAliasObject>>,
    alias_list_of_object: Option<MyCollectionAliasObject>,
}

impl PostRequestBuilder {
    pub fn maybe_string(mut self, value: impl Into<String>) -> Self {
        self.maybe_string = Some(value.into());
        self
    }

    pub fn integer(mut self, value: i64) -> Self {
        self.integer = Some(value);
        self
    }

    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn file_list(mut self, value: Vec<u8>) -> Self {
        self.file_list = Some(value);
        self
    }

    pub fn maybe_file(mut self, value: Vec<u8>) -> Self {
        self.maybe_file = Some(value);
        self
    }

    pub fn maybe_file_list(mut self, value: Vec<u8>) -> Self {
        self.maybe_file_list = Some(value);
        self
    }

    pub fn maybe_integer(mut self, value: i64) -> Self {
        self.maybe_integer = Some(value);
        self
    }

    pub fn optional_list_of_strings(mut self, value: Vec<String>) -> Self {
        self.optional_list_of_strings = Some(value);
        self
    }

    pub fn list_of_objects(mut self, value: Vec<MyObject>) -> Self {
        self.list_of_objects = Some(value);
        self
    }

    pub fn optional_metadata(mut self, value: serde_json::Value) -> Self {
        self.optional_metadata = Some(value);
        self
    }

    pub fn optional_object_type(mut self, value: ObjectType) -> Self {
        self.optional_object_type = Some(value);
        self
    }

    pub fn optional_id(mut self, value: Id) -> Self {
        self.optional_id = Some(value);
        self
    }

    pub fn alias_object(mut self, value: MyAliasObject) -> Self {
        self.alias_object = Some(value);
        self
    }

    pub fn list_of_alias_object(mut self, value: Vec<MyAliasObject>) -> Self {
        self.list_of_alias_object = Some(value);
        self
    }

    pub fn alias_list_of_object(mut self, value: MyCollectionAliasObject) -> Self {
        self.alias_list_of_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PostRequest`].
    pub fn build(self) -> Result<PostRequest, BuildError> {
        Ok(PostRequest {
            maybe_string: self.maybe_string,
            integer: self.integer,
            file: self.file,
            file_list: self.file_list,
            maybe_file: self.maybe_file,
            maybe_file_list: self.maybe_file_list,
            maybe_integer: self.maybe_integer,
            optional_list_of_strings: self.optional_list_of_strings,
            list_of_objects: self.list_of_objects,
            optional_metadata: self.optional_metadata,
            optional_object_type: self.optional_object_type,
            optional_id: self.optional_id,
            alias_object: self.alias_object,
            list_of_alias_object: self.list_of_alias_object,
            alias_list_of_object: self.alias_list_of_object,
        })
    }
}
