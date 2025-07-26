use crate::language::Language;
use crate::problem_files::ProblemFiles;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesResponse {
    pub files: HashMap<Language, ProblemFiles>,
}