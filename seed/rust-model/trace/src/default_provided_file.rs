use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DefaultProvidedFile {
    pub file: FileInfoV2,
    #[serde(rename = "relatedTypes")]
    pub related_types: Vec<VariableType>,
}