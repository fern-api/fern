pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemDefaultProvidedFile {
    pub file: V2ProblemFileInfoV2,
    #[serde(rename = "relatedTypes")]
    pub related_types: Vec<VariableType>,
}