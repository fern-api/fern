pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemGetGeneratedTestCaseTemplateFileRequest {
    pub template: V2V3ProblemTestCaseTemplate,
}
