pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference {
    #[serde(rename = "templateId")]
    #[non_exhaustive]
    TemplateId { value: TestCaseTemplateId },

    #[serde(rename = "implementation")]
    #[non_exhaustive]
    Implementation {
        #[serde(flatten)]
        data: TestCaseImplementation,
    },
}

impl TestCaseImplementationReference {
    pub fn template_id(value: TestCaseTemplateId) -> Self {
        Self::TemplateId { value }
    }

    pub fn implementation(data: TestCaseImplementation) -> Self {
        Self::Implementation { data }
    }
}
