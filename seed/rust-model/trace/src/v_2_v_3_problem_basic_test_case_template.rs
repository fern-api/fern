pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BasicTestCaseTemplate2 {
    #[serde(rename = "templateId")]
    pub template_id: TestCaseTemplateId2,
    pub name: String,
    pub description: TestCaseImplementationDescription2,
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: ParameterId2,
}