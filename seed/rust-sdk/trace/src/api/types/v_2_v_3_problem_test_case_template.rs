pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate2 {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId2,
    #[serde(default)]
    pub name: String,
    pub implementation: TestCaseImplementation2,
}
