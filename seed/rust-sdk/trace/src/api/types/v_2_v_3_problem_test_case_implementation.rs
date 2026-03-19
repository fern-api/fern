pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation2 {
    #[serde(default)]
    pub description: TestCaseImplementationDescription2,
    pub function: TestCaseFunction2,
}
