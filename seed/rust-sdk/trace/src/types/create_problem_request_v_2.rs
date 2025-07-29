use crate::problem_description::ProblemDescription;
use crate::custom_files::CustomFiles;
use crate::test_case_template::TestCaseTemplate;
use crate::test_case_v_2::TestCaseV2;
use crate::language::Language;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateProblemRequestV2 {
    #[serde(rename = "problemName")]
    pub problem_name: String,
    #[serde(rename = "problemDescription")]
    pub problem_description: ProblemDescription,
    #[serde(rename = "customFiles")]
    pub custom_files: CustomFiles,
    #[serde(rename = "customTestCaseTemplates")]
    pub custom_test_case_templates: Vec<TestCaseTemplate>,
    pub testcases: Vec<TestCaseV2>,
    #[serde(rename = "supportedLanguages")]
    pub supported_languages: std::collections::HashSet<Language>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}