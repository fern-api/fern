pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WithFormEncodedContainersRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    #[serde(default)]
    pub integer: i64,
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(default)]
    pub file_list: Vec<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub maybe_file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_file_list: Option<Vec<Vec<u8>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list_of_strings: Option<Vec<String>>,
    #[serde(default)]
    pub list_of_objects: Vec<MyObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_metadata: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object_type: Option<ObjectType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_id: Option<Id>,
    #[serde(default)]
    pub list_of_objects_with_optionals: Vec<MyObjectWithOptional>,
    #[serde(default)]
    pub alias_object: MyAliasObject,
    #[serde(default)]
    pub list_of_alias_object: Vec<MyAliasObject>,
    #[serde(default)]
    pub alias_list_of_object: MyCollectionAliasObject,
}
impl WithFormEncodedContainersRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    for file_data in &self.file_list {
        form = form.part(
            "file_list",
            reqwest::multipart::Part::bytes(file_data.clone())
                .file_name("file_list")
                .mime_str("application/octet-stream").unwrap()
        );
    }

    if let Some(ref file_data) = self.maybe_file {
        form = form.part(
            "maybe_file",
            reqwest::multipart::Part::bytes(file_data.clone())
                .file_name("maybe_file")
                .mime_str("application/octet-stream").unwrap()
        );
    }

    if let Some(ref files) = self.maybe_file_list {
        for file_data in files {
            form = form.part(
                "maybe_file_list",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("maybe_file_list")
                    .mime_str("application/octet-stream").unwrap()
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

    if let Ok(json_str) = serde_json::to_string(&self.list_of_objects_with_optionals) {
        form = form.text("list_of_objects_with_optionals", json_str);
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

impl WithFormEncodedContainersRequest {
    pub fn builder() -> WithFormEncodedContainersRequestBuilder {
        <WithFormEncodedContainersRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithFormEncodedContainersRequestBuilder {
    maybe_string: Option<String>,
    integer: Option<i64>,
    file: Option<Vec<u8>>,
    file_list: Option<Vec<Vec<u8>>>,
    maybe_file: Option<Vec<u8>>,
    maybe_file_list: Option<Vec<Vec<u8>>>,
    maybe_integer: Option<i64>,
    optional_list_of_strings: Option<Vec<String>>,
    list_of_objects: Option<Vec<MyObject>>,
    optional_metadata: Option<serde_json::Value>,
    optional_object_type: Option<ObjectType>,
    optional_id: Option<Id>,
    list_of_objects_with_optionals: Option<Vec<MyObjectWithOptional>>,
    alias_object: Option<MyAliasObject>,
    list_of_alias_object: Option<Vec<MyAliasObject>>,
    alias_list_of_object: Option<MyCollectionAliasObject>,
}

impl WithFormEncodedContainersRequestBuilder {
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

    pub fn file_list(mut self, value: Vec<Vec<u8>>) -> Self {
        self.file_list = Some(value);
        self
    }

    pub fn maybe_file(mut self, value: Vec<u8>) -> Self {
        self.maybe_file = Some(value);
        self
    }

    pub fn maybe_file_list(mut self, value: Vec<Vec<u8>>) -> Self {
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

    pub fn list_of_objects_with_optionals(mut self, value: Vec<MyObjectWithOptional>) -> Self {
        self.list_of_objects_with_optionals = Some(value);
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

    /// Consumes the builder and constructs a [`WithFormEncodedContainersRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`integer`](WithFormEncodedContainersRequestBuilder::integer)
    /// - [`file`](WithFormEncodedContainersRequestBuilder::file)
    /// - [`file_list`](WithFormEncodedContainersRequestBuilder::file_list)
    /// - [`list_of_objects`](WithFormEncodedContainersRequestBuilder::list_of_objects)
    /// - [`list_of_objects_with_optionals`](WithFormEncodedContainersRequestBuilder::list_of_objects_with_optionals)
    /// - [`alias_object`](WithFormEncodedContainersRequestBuilder::alias_object)
    /// - [`list_of_alias_object`](WithFormEncodedContainersRequestBuilder::list_of_alias_object)
    /// - [`alias_list_of_object`](WithFormEncodedContainersRequestBuilder::alias_list_of_object)
    pub fn build(self) -> Result<WithFormEncodedContainersRequest, BuildError> {
        Ok(WithFormEncodedContainersRequest {
            maybe_string: self.maybe_string,
            integer: self.integer.ok_or_else(|| BuildError::missing_field("integer"))?,
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            file_list: self.file_list.ok_or_else(|| BuildError::missing_field("file_list"))?,
            maybe_file: self.maybe_file,
            maybe_file_list: self.maybe_file_list,
            maybe_integer: self.maybe_integer,
            optional_list_of_strings: self.optional_list_of_strings,
            list_of_objects: self.list_of_objects.ok_or_else(|| BuildError::missing_field("list_of_objects"))?,
            optional_metadata: self.optional_metadata,
            optional_object_type: self.optional_object_type,
            optional_id: self.optional_id,
            list_of_objects_with_optionals: self.list_of_objects_with_optionals.ok_or_else(|| BuildError::missing_field("list_of_objects_with_optionals"))?,
            alias_object: self.alias_object.ok_or_else(|| BuildError::missing_field("alias_object"))?,
            list_of_alias_object: self.list_of_alias_object.ok_or_else(|| BuildError::missing_field("list_of_alias_object"))?,
            alias_list_of_object: self.alias_list_of_object.ok_or_else(|| BuildError::missing_field("alias_list_of_object"))?,
        })
    }
}
