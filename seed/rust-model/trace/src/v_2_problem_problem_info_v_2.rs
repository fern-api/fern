use crate::commons_problem_id::ProblemId;
use crate::problem_problem_description::ProblemDescription;
use crate::commons_language::Language;
use crate::v_2_problem_custom_files::CustomFiles;
use crate::v_2_problem_generated_files::GeneratedFiles;
use crate::v_2_problem_test_case_template::TestCaseTemplate;
use crate::v_2_problem_test_case_v_2::TestCaseV2;
use std::collections::HashSet;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemInfoV2 {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemDescription,
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: HashSet<Language>,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles,
    #[serde(rename = "generatedFiles")]
    pub generated_files: GeneratedFiles,
    #[serde(rename = "customTestCaseTemplates")]
    pub custom_test_case_templates: Vec<TestCaseTemplate>,
    pub testcases: Vec<TestCaseV2>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}