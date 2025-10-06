pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemGetDefaultStarterFilesResponse {
    pub files: HashMap<CommonsLanguage, ProblemProblemFiles>,
}
