pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DefaultProvidedFile2 {
    #[serde(default)]
    pub file: FileInfoV22,
    #[serde(rename = "relatedTypes")]
    #[serde(default)]
    pub related_types: Vec<VariableType>,
}