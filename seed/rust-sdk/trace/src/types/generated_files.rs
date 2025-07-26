use crate::language::Language;
use crate::files::Files;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GeneratedFiles {
    #[serde(rename = "generatedTestCaseFiles")]
    pub generated_test_case_files: HashMap<Language, Files>,
    #[serde(rename = "generatedTemplateFiles")]
    pub generated_template_files: HashMap<Language, Files>,
    pub other: HashMap<Language, Files>,
}