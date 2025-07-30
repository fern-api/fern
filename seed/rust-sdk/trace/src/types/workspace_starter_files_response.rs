use crate::language::Language;
use crate::workspace_files::WorkspaceFiles;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceStarterFilesResponse {
    pub files: HashMap<Language, WorkspaceFiles>,
}