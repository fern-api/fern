pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemTestCaseImplementationDescription {
    pub boards: Vec<V2V3ProblemTestCaseImplementationDescriptionBoard>,
}