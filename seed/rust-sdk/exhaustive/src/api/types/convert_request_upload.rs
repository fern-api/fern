pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ConvertRequest2 {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_string: Option<String>,
}
impl ConvertRequest2 {
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

impl ConvertRequest2 {
    pub fn builder() -> ConvertRequest2Builder {
        <ConvertRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ConvertRequest2Builder {
    file: Option<Vec<u8>>,
    maybe_string: Option<String>,
}

impl ConvertRequest2Builder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn maybe_string(mut self, value: impl Into<String>) -> Self {
        self.maybe_string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ConvertRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](ConvertRequest2Builder::file)
    pub fn build(self) -> Result<ConvertRequest2, BuildError> {
        Ok(ConvertRequest2 {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            maybe_string: self.maybe_string,
        })
    }
}
