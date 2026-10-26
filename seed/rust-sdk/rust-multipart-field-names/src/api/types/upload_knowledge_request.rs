pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UploadKnowledgeRequest {
    #[serde(rename = "file_0")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file0: Vec<u8>,
    #[serde(rename = "file_1")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file1: Option<Vec<u8>>,
    #[serde(rename = "URLPath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url_path: Option<String>,
    #[serde(rename = "display_name_2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name2: Option<String>,
}
impl UploadKnowledgeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file_0",
            reqwest::multipart::Part::bytes(self.file0.clone())
                .file_name("file_0")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Some(ref file_data) = self.file1 {
            form = form.part(
                "file_1",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file_1")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref value) = self.url_path {
            form = form.text("URLPath", value.clone());
        }

        if let Some(ref value) = self.display_name2 {
            form = form.text("display_name_2", value.clone());
        }

        form
    }
}

impl UploadKnowledgeRequest {
    pub fn builder() -> UploadKnowledgeRequestBuilder {
        <UploadKnowledgeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadKnowledgeRequestBuilder {
    file0: Option<Vec<u8>>,
    file1: Option<Vec<u8>>,
    url_path: Option<String>,
    display_name2: Option<String>,
}

impl UploadKnowledgeRequestBuilder {
    pub fn file0(mut self, value: Vec<u8>) -> Self {
        self.file0 = Some(value);
        self
    }

    pub fn file1(mut self, value: Vec<u8>) -> Self {
        self.file1 = Some(value);
        self
    }

    pub fn url_path(mut self, value: impl Into<String>) -> Self {
        self.url_path = Some(value.into());
        self
    }

    pub fn display_name2(mut self, value: impl Into<String>) -> Self {
        self.display_name2 = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UploadKnowledgeRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file0`](UploadKnowledgeRequestBuilder::file0)
    pub fn build(self) -> Result<UploadKnowledgeRequest, BuildError> {
        Ok(UploadKnowledgeRequest {
            file0: self
                .file0
                .ok_or_else(|| BuildError::missing_field("file0"))?,
            file1: self.file1,
            url_path: self.url_path,
            display_name2: self.display_name2,
        })
    }
}
