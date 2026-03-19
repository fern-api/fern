pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: TestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId,
}