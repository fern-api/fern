pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    pub implementation: TestCaseImplementation,
}
