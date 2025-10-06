pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemCreateProblemRequestV2 {
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: V2ProblemCustomFiles,
    #[serde(rename = "customTestCaseTemplates")]
    pub custom_test_case_templates: Vec<V2ProblemTestCaseTemplate>,
    pub testcases: Vec<V2ProblemTestCaseV2>,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: HashSet<CommonsLanguage>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}