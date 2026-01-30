pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference2 {
        #[serde(rename = "templateId")]
        TemplateId {
            value: TestCaseTemplateId2,
        },

        #[serde(rename = "implementation")]
        Implementation {
            #[serde(flatten)]
            data: TestCaseImplementation2,
        },
}
