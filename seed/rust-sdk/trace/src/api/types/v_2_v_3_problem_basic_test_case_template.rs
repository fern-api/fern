pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BasicTestCaseTemplate2 {
    #[serde(rename = "templateId")]
    #[serde(default)]
    pub template_id: TestCaseTemplateId2,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: TestCaseImplementationDescription2,
    #[serde(rename = "expectedValueParameterId")]
    #[serde(default)]
    pub expected_value_parameter_id: ParameterId2,
}
