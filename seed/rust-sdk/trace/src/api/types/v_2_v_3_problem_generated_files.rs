pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GeneratedFiles2 {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<Language, Files2>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<Language, Files2>,
    pub other: HashMap<Language, Files2>,
}