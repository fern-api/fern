pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemInfoV22 {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemDescription")]
    #[serde(default)]
    pub problem_description: ProblemDescription,
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
    #[serde(rename = "supportedLanguages")]
    #[serde(default)]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles2,
    #[serde(rename = "generatedFiles")]
    #[serde(default)]
    pub generated_files: GeneratedFiles2,
    #[serde(rename = "customTestCaseTemplates")]
    #[serde(default)]
    pub custom_test_case_templates: Vec<TestCaseTemplate2>,
    #[serde(default)]
    pub testcases: Vec<TestCaseV22>,
    #[serde(rename = "isPublic")]
    #[serde(default)]
    pub is_public: bool,
}