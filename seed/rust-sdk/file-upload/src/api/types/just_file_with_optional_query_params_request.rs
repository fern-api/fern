pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileWithOptionalQueryParamsRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(rename = "maybeString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
    #[serde(rename = "maybeInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_integer: Option<i64>,
}
impl JustFileWithOptionalQueryParamsRequest {
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

        if let Some(ref value) = self.maybe_integer {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybeInteger", json_str);
            }
        }

        form
    }
}

impl JustFileWithOptionalQueryParamsRequest {
    pub fn builder() -> JustFileWithOptionalQueryParamsRequestBuilder {
        JustFileWithOptionalQueryParamsRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JustFileWithOptionalQueryParamsRequestBuilder {
    file: Option<Vec<u8>>,
    maybe_string: Option<String>,
    maybe_integer: Option<i64>,
}

impl JustFileWithOptionalQueryParamsRequestBuilder {
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

    /// Consumes the builder and constructs a [`JustFileWithOptionalQueryParamsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](JustFileWithOptionalQueryParamsRequestBuilder::file)
    pub fn build(self) -> Result<JustFileWithOptionalQueryParamsRequest, BuildError> {
        Ok(JustFileWithOptionalQueryParamsRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            maybe_string: self.maybe_string,
            maybe_integer: self.maybe_integer,
        })
    }
}
