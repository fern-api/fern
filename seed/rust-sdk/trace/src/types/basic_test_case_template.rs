use crate::test_case_template_id::TestCaseTemplateId;
use crate::test_case_implementation_description::TestCaseImplementationDescription;
use crate::parameter_id::ParameterId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId,
    pub name: String,
    pub description: TestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: ParameterId,
}