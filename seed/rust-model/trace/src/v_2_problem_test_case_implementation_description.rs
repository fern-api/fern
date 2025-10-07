pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementationDescription {
    pub boards: Vec<TestCaseImplementationDescriptionBoard>,
}