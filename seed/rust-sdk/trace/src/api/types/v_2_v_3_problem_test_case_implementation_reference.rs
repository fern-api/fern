pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2V3ProblemTestCaseImplementationReference {
    TemplateId {
        value: V2V3ProblemTestCaseTemplateId,
    },

    Implementation {
        #[serde(flatten)]
        data: V2V3ProblemTestCaseImplementation,
    },
}
