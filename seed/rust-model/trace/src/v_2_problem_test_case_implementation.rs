pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation {
    pub description: TestCaseImplementationDescription,
    pub function: TestCaseFunction,
}