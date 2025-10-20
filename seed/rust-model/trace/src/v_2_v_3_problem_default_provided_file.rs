pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DefaultProvidedFile2 {
    pub file: FileInfoV22,
    #[serde(rename = "relatedTypes")]
    pub related_types: Vec<VariableType>,
}