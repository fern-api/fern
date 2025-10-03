pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesResponse {
    pub files: HashMap<Language, ProblemFiles>,
}