pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum V2ProblemTestCaseImplementationDescriptionBoard {
    Html { value: String },

    ParamId { value: V2ProblemParameterId },
}
