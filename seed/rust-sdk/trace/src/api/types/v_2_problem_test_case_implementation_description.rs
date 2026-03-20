pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseImplementationDescription {
    #[serde(default)]
    pub boards: Vec<TestCaseImplementationDescriptionBoard>,
}
