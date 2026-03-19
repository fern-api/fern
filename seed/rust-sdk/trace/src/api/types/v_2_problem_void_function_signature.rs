pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
}
