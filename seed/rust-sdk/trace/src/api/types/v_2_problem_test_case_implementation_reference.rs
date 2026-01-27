pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference {
        #[serde(rename = "templateId")]
        TemplateId {
            value: TestCaseTemplateId,
        },

        #[serde(rename = "implementation")]
        Implementation {
            #[serde(flatten)]
            data: TestCaseImplementation,
        },
}
