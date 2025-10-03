pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemTestCaseImplementation {
    pub description: V2V3ProblemTestCaseImplementationDescription,
    pub function: V2V3ProblemTestCaseFunction,
}
