use crate::commons_language::Language;
use crate::v_2_problem_files::Files;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<Language, Files>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<Language, Files>,
    pub other: HashMap<Language, Files>,
}
