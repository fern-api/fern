pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithLiteralAndEnumTypesRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_type: Option<ModelType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub open_enum: Option<OpenEnumType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_name: Option<String>,
}
impl WithLiteralAndEnumTypesRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Some(ref value) = self.model_type {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("model_type", json_str);
            }
        }

        if let Some(ref value) = self.open_enum {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("open_enum", json_str);
            }
        }

        if let Some(ref value) = self.maybe_name {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybe_name", json_str);
            }
        }

        form
    }
}

impl WithLiteralAndEnumTypesRequest {
    pub fn builder() -> WithLiteralAndEnumTypesRequestBuilder {
        WithLiteralAndEnumTypesRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithLiteralAndEnumTypesRequestBuilder {
    file: Option<Vec<u8>>,
    model_type: Option<ModelType>,
    open_enum: Option<OpenEnumType>,
    maybe_name: Option<String>,
}

impl WithLiteralAndEnumTypesRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn model_type(mut self, value: ModelType) -> Self {
        self.model_type = Some(value);
        self
    }

    pub fn open_enum(mut self, value: OpenEnumType) -> Self {
        self.open_enum = Some(value);
        self
    }

    pub fn maybe_name(mut self, value: impl Into<String>) -> Self {
        self.maybe_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WithLiteralAndEnumTypesRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](WithLiteralAndEnumTypesRequestBuilder::file)
    pub fn build(self) -> Result<WithLiteralAndEnumTypesRequest, BuildError> {
        Ok(WithLiteralAndEnumTypesRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            model_type: self.model_type,
            open_enum: self.open_enum,
            maybe_name: self.maybe_name,
        })
    }
}
