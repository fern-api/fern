pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction {
        #[serde(rename = "withActualResult")]
        WithActualResult {
            #[serde(flatten)]
            data: TestCaseWithActualResultImplementation,
        },

        #[serde(rename = "custom")]
        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinition,
        },
}
