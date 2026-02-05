pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateProblemRequestV22 {
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles2,
    #[serde(rename = "customTestCaseTemplates")]
    pub custom_test_case_templates: Vec<TestCaseTemplate2>,
    pub testcases: Vec<TestCaseV22>,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}