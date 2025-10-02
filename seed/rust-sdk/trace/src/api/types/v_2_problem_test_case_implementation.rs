pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemTestCaseImplementation {
    pub description: V2ProblemTestCaseImplementationDescription,
    pub function: V2ProblemTestCaseFunction,
}
