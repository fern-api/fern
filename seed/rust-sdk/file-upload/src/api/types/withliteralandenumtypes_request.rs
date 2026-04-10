pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithliteralandenumtypesRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_type: Option<ModelType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub open_enum: Option<OpenEnumType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_name: Option<String>,
}
impl WithliteralandenumtypesRequest {
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

impl WithliteralandenumtypesRequest {
    pub fn builder() -> WithliteralandenumtypesRequestBuilder {
        <WithliteralandenumtypesRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithliteralandenumtypesRequestBuilder {
    file: Option<Vec<u8>>,
    model_type: Option<ModelType>,
    open_enum: Option<OpenEnumType>,
    maybe_name: Option<String>,
}

impl WithliteralandenumtypesRequestBuilder {
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

    /// Consumes the builder and constructs a [`WithliteralandenumtypesRequest`].
    pub fn build(self) -> Result<WithliteralandenumtypesRequest, BuildError> {
        Ok(WithliteralandenumtypesRequest {
            file: self.file,
            model_type: self.model_type,
            open_enum: self.open_enum,
            maybe_name: self.maybe_name,
        })
    }
}
