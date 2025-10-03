pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemTestCaseImplementationDescription {
    pub boards: Vec<V2ProblemTestCaseImplementationDescriptionBoard>,
}