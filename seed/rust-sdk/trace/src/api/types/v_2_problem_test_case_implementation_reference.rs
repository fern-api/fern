pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2ProblemTestCaseImplementationReference {
    TemplateId {
        value: V2ProblemTestCaseTemplateId,
    },

    Implementation {
        #[serde(flatten)]
        data: V2ProblemTestCaseImplementation,
    },
}
