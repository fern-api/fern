pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum V2V3ProblemTestCaseImplementationDescriptionBoard {
        Html {
            value: String,
        },

        ParamId {
            value: V2V3ProblemParameterId,
        },
}
