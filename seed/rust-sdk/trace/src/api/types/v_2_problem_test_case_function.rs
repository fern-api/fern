pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2ProblemTestCaseFunction {
    WithActualResult {
        #[serde(flatten)]
        data: V2ProblemTestCaseWithActualResultImplementation,
    },

    Custom {
        #[serde(flatten)]
        data: V2ProblemVoidFunctionDefinition,
    },
}
