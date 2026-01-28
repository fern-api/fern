pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction2 {
        #[serde(rename = "withActualResult")]
        WithActualResult {
            #[serde(flatten)]
            data: TestCaseWithActualResultImplementation2,
        },

        #[serde(rename = "custom")]
        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinition2,
        },
}
