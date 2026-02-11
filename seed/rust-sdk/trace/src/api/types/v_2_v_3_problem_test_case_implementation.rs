pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation2 {
    pub description: TestCaseImplementationDescription2,
    pub function: TestCaseFunction2,
}