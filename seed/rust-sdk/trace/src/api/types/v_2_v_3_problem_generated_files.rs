pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GeneratedFiles2 {
    #[serde(rename = "generatedTestCaseFiles")]
    #[serde(default)]
    pub generated_test_case_files: HashMap<Language, Files2>,
    #[serde(rename = "generatedTemplateFiles")]
    #[serde(default)]
    pub generated_template_files: HashMap<Language, Files2>,
    #[serde(default)]
    pub other: HashMap<Language, Files2>,
}
