pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseTemplateFileRequest2 {
    pub template: TestCaseTemplate2,
}