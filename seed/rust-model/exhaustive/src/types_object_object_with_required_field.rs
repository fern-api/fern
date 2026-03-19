pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
}