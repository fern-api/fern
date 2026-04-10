pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference2 {
        #[serde(rename = "templateId")]
        #[non_exhaustive]
        TemplateId {
            value: TestCaseTemplateId2,
        },

        #[serde(rename = "implementation")]
        #[non_exhaustive]
        Implementation {
            #[serde(flatten)]
            data: TestCaseImplementation2,
        },
}

impl TestCaseImplementationReference2 {
    pub fn template_id(value: TestCaseTemplateId2) -> Self {
        Self::TemplateId { value }
    }

    pub fn implementation(data: TestCaseImplementation2) -> Self {
        Self::Implementation { data }
    }
}
