pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction2 {
    WithActualResult {
        #[serde(flatten)]
        data: TestCaseWithActualResultImplementation2,
    },

    Custom {
        #[serde(flatten)]
        data: VoidFunctionDefinition2,
    },
}
