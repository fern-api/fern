use crate::commons_language::Language;
use crate::submission_workspace_files::WorkspaceFiles;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceStarterFilesResponse {
    pub files: HashMap<Language, WorkspaceFiles>,
}