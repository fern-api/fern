pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateProblemRequestV22 {
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    #[serde(default)]
    pub problem_description: ProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles2,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<TestCaseTemplate2>,
    #[serde(default)]
    pub testcases: Vec<TestCaseV22>,
    #[serde(rename = "supportedLanguages")]
    #[serde(default)]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}