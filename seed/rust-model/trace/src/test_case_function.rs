use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction {
        WithActualResult {
            #[serde(flatten)]
            data: TestCaseWithActualResultImplementation,
        },

        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinition,
        },
}
