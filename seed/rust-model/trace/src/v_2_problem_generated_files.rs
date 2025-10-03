pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<Language, V2ProblemFiles>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<Language, V2ProblemFiles>,
    pub other: HashMap<Language, V2ProblemFiles>,
}
