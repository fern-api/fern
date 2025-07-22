use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId,
    pub name: String,
    pub implementation: TestCaseImplementation,
}