pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate2 {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId2,
    pub name: String,
    pub implementation: TestCaseImplementation2,
}