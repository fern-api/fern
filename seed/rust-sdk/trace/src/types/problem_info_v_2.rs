use crate::problem_id::ProblemId;
use crate::problem_description::ProblemDescription;
use crate::language::Language;
use crate::custom_files::CustomFiles;
use crate::generated_files::GeneratedFiles;
use crate::test_case_template::TestCaseTemplate;
use crate::test_case_v_2::TestCaseV2;
use std::collections::HashMap;
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
    pub problem_version: i32,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: std::collections::HashSet<Language>,
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