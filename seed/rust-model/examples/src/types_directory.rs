pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesDirectory {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<TypesFile>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<TypesDirectory>>,
}