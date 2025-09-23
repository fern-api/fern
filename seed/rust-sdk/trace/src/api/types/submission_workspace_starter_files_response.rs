use crate::commons_language::Language;
use crate::submission_workspace_files::WorkspaceFiles;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceStarterFilesResponse {
    pub files: HashMap<Language, WorkspaceFiles>,
}
