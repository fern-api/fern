use crate::test_case_template_id::TestCaseTemplateId;
use crate::test_case_implementation::TestCaseImplementation;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId,
    pub name: String,
    pub implementation: TestCaseImplementation,
}