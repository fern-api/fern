pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2V3ProblemTestCaseFunction {
        WithActualResult {
            #[serde(flatten)]
            data: V2V3ProblemTestCaseWithActualResultImplementation,
        },

        Custom {
            #[serde(flatten)]
            data: V2V3ProblemVoidFunctionDefinition,
        },
}
