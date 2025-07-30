use crate::language::Language;
use crate::files::Files;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceStarterFilesResponseV2 {
    #[serde(rename = "filesByLanguage")]
    pub files_by_language: HashMap<Language, Files>,
}