pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemDefaultProvidedFile {
    pub file: V2V3ProblemFileInfoV2,
    #[serde(rename = "relatedTypes")]
    pub related_types: Vec<VariableType>,
}
