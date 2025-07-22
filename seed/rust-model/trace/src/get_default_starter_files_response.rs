use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesResponse {
    pub files: HashMap<Language, ProblemFiles>,
}