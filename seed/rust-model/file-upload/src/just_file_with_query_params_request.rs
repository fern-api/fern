pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileWithQueryParamsRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
    #[serde(rename = "listOfStrings")]
    #[serde(default)]
    pub list_of_strings: Vec<String>,
    #[serde(rename = "optionalListOfStrings")]
    #[serde(default)]
    pub optional_list_of_strings: Vec<Option<String>>,
}
impl JustFileWithQueryParamsRequest {
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

impl JustFileWithQueryParamsRequest {
    pub fn builder() -> JustFileWithQueryParamsRequestBuilder {
        <JustFileWithQueryParamsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JustFileWithQueryParamsRequestBuilder {
    file: Option<Vec<u8>>,
    maybe_string: Option<String>,
    integer: Option<i64>,
    maybe_integer: Option<i64>,
    list_of_strings: Option<Vec<String>>,
    optional_list_of_strings: Option<Vec<Option<String>>>,
}

impl JustFileWithQueryParamsRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn maybe_string(mut self, value: impl Into<String>) -> Self {
        self.maybe_string = Some(value.into());
        self
    }

    pub fn integer(mut self, value: i64) -> Self {
        self.integer = Some(value);
        self
    }

    pub fn maybe_integer(mut self, value: i64) -> Self {
        self.maybe_integer = Some(value);
        self
    }

    pub fn list_of_strings(mut self, value: Vec<String>) -> Self {
        self.list_of_strings = Some(value);
        self
    }

    pub fn optional_list_of_strings(mut self, value: Vec<Option<String>>) -> Self {
        self.optional_list_of_strings = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`JustFileWithQueryParamsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](JustFileWithQueryParamsRequestBuilder::file)
    /// - [`integer`](JustFileWithQueryParamsRequestBuilder::integer)
    /// - [`list_of_strings`](JustFileWithQueryParamsRequestBuilder::list_of_strings)
    /// - [`optional_list_of_strings`](JustFileWithQueryParamsRequestBuilder::optional_list_of_strings)
    pub fn build(self) -> Result<JustFileWithQueryParamsRequest, BuildError> {
        Ok(JustFileWithQueryParamsRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            maybe_string: self.maybe_string,
            integer: self.integer.ok_or_else(|| BuildError::missing_field("integer"))?,
            maybe_integer: self.maybe_integer,
            list_of_strings: self.list_of_strings.ok_or_else(|| BuildError::missing_field("list_of_strings"))?,
            optional_list_of_strings: self.optional_list_of_strings.ok_or_else(|| BuildError::missing_field("optional_list_of_strings"))?,
        })
    }
}
