pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemProblemInfoV2 {
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemProblemDescription,
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: HashSet<CommonsLanguage>,
    #[serde(rename = "customFiles")]
    pub custom_files: V2V3ProblemCustomFiles,
    #[serde(rename = "generatedFiles")]
    pub generated_files: V2V3ProblemGeneratedFiles,
    #[serde(rename = "customTestCaseTemplates")]
    pub custom_test_case_templates: Vec<V2V3ProblemTestCaseTemplate>,
    pub testcases: Vec<V2V3ProblemTestCaseV2>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}
