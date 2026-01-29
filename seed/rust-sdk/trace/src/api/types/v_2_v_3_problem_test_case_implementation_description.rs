pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementationDescription2 {
    pub boards: Vec<TestCaseImplementationDescriptionBoard2>,
}