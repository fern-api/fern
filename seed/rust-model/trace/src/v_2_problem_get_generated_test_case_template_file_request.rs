pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGetGeneratedTestCaseTemplateFileRequest {
    pub template: V2ProblemTestCaseTemplate,
}
