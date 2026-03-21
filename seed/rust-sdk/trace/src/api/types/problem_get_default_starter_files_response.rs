pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetDefaultStarterFilesResponse {
    #[serde(default)]
    pub files: HashMap<Language, ProblemFiles>,
}
