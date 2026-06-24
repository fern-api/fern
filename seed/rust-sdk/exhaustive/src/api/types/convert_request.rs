pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ConvertRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip)]
    pub maybe_string: Option<String>,
    #[serde(rename = "maybeString")]
    #[serde(skip)]
    pub maybe_string: Option<String>,
    #[serde(skip)]
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "maybeInteger")]
    #[serde(skip)]
    pub maybe_integer: Option<i64>,
}
impl ConvertRequest {
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
                form = form.text("maybe_string", json_str);
            }
        }

        form
    }
}

impl ConvertRequest {
    pub fn builder() -> ConvertRequestBuilder {
        <ConvertRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ConvertRequestBuilder {
    file: Option<Vec<u8>>,
    maybe_string: Option<String>,
    maybe_string: Option<String>,
    integer: Option<i64>,
    maybe_integer: Option<i64>,
}

impl ConvertRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn maybe_string(mut self, value: impl Into<String>) -> Self {
        self.maybe_string = Some(value.into());
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

    /// Consumes the builder and constructs a [`ConvertRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](ConvertRequestBuilder::file)
    /// - [`integer`](ConvertRequestBuilder::integer)
    pub fn build(self) -> Result<ConvertRequest, BuildError> {
        Ok(ConvertRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            maybe_string: self.maybe_string,
            maybe_string: self.maybe_string,
            integer: self
                .integer
                .ok_or_else(|| BuildError::missing_field("integer"))?,
            maybe_integer: self.maybe_integer,
        })
    }
}
