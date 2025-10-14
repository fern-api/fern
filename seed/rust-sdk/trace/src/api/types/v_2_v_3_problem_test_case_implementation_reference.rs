pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference2 {
    TemplateId {
        value: TestCaseTemplateId2,
    },

    Implementation {
        #[serde(flatten)]
        data: TestCaseImplementation2,
    },
}
