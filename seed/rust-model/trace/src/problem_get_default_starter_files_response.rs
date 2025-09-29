use crate::commons_language::Language;
use crate::problem_problem_files::ProblemFiles;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetDefaultStarterFilesResponse {
    pub files: HashMap<Language, ProblemFiles>,
}