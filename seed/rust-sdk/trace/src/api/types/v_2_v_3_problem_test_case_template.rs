pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemTestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: V2V3ProblemTestCaseTemplateId,
    pub name: String,
    pub implementation: V2V3ProblemTestCaseImplementation,
}
