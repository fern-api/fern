pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseTemplateFileRequest {
    pub template: TestCaseTemplate,
}