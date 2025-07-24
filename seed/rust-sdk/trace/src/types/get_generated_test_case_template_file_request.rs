use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseTemplateFileRequest {
    pub template: TestCaseTemplate,
}