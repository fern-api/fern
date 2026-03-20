pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseImplementationDescription2 {
    #[serde(default)]
    pub boards: Vec<TestCaseImplementationDescriptionBoard2>,
}
