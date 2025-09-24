use crate::v_2_problem_test_case_template_id::TestCaseTemplateId;
use crate::v_2_problem_test_case_implementation::TestCaseImplementation;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId,
    pub name: String,
    pub implementation: TestCaseImplementation,
}