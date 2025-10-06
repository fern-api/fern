pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemGeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<CommonsLanguage, V2V3ProblemFiles>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<CommonsLanguage, V2V3ProblemFiles>,
    pub other: HashMap<CommonsLanguage, V2V3ProblemFiles>,
}
