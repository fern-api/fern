pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum TestCaseImplementationReference2 {
    #[serde(rename = "templateId")]
    #[non_exhaustive]
    TemplateId { value: TestCaseTemplateId2 },

    #[serde(rename = "implementation")]
    #[non_exhaustive]
    Implementation {
        #[serde(flatten)]
        data: TestCaseImplementation2,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl TestCaseImplementationReference2 {
    pub fn template_id(value: TestCaseTemplateId2) -> Self {
        Self::TemplateId { value }
    }

    pub fn implementation(data: TestCaseImplementation2) -> Self {
        Self::Implementation { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
