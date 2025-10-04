pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemBasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: V2V3ProblemTestCaseTemplateId,
    pub name: String,
    pub description: V2V3ProblemTestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: V2V3ProblemParameterId,
}