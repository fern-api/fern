pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemTestCaseTemplate {
    #[serde(rename = "templateId")]
    pub template_id: V2ProblemTestCaseTemplateId,
    pub name: String,
    pub implementation: V2ProblemTestCaseImplementation,
}
