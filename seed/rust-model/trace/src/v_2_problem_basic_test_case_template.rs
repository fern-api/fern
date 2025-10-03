pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemBasicTestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: V2ProblemTestCaseTemplateId,
    pub name: String,
    pub description: V2ProblemTestCaseImplementationDescription,
    #[serde(rename = "expectedValueParameterId")]
    pub expected_value_parameter_id: V2ProblemParameterId,
}