use crate::commons_language::Language;
use crate::v_2_problem_files::Files;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceStarterFilesResponseV2 {
    #[serde(rename = "filesByLanguage")]
    pub files_by_language: HashMap<Language, Files>,
}