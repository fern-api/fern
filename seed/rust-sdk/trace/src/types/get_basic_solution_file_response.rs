use crate::language::Language;
use crate::file_info_v_2::FileInfoV2;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    pub solution_file_by_language: HashMap<Language, FileInfoV2>,
}