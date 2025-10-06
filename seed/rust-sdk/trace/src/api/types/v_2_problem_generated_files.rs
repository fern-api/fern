pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<CommonsLanguage, V2ProblemFiles>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<CommonsLanguage, V2ProblemFiles>,
    pub other: HashMap<CommonsLanguage, V2ProblemFiles>,
}
