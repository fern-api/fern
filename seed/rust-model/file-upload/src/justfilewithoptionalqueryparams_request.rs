pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct JustfilewithoptionalqueryparamsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing)]
    pub maybe_string: Option<String>,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing)]
    pub maybe_integer: Option<i64>,
}
impl JustfilewithoptionalqueryparamsRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    if let Some(ref file_data) = self.file {
        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(file_data.clone())
                .file_name("file")
                .mime_str("application/octet-stream").unwrap()
        );
    }

    form
}
}

impl JustfilewithoptionalqueryparamsRequest {
    pub fn builder() -> JustfilewithoptionalqueryparamsRequestBuilder {
        <JustfilewithoptionalqueryparamsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JustfilewithoptionalqueryparamsRequestBuilder {
    file: Option<Vec<u8>>,
    maybe_string: Option<String>,
    maybe_integer: Option<i64>,
}

impl JustfilewithoptionalqueryparamsRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn maybe_string(mut self, value: impl Into<String>) -> Self {
        self.maybe_string = Some(value.into());
        self
    }

    pub fn maybe_integer(mut self, value: i64) -> Self {
        self.maybe_integer = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`JustfilewithoptionalqueryparamsRequest`].
    pub fn build(self) -> Result<JustfilewithoptionalqueryparamsRequest, BuildError> {
        Ok(JustfilewithoptionalqueryparamsRequest {
            file: self.file,
            maybe_string: self.maybe_string,
            maybe_integer: self.maybe_integer,
        })
    }
}
