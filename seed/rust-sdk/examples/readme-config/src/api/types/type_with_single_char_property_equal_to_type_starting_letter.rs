pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypeWithSingleCharPropertyEqualToTypeStartingLetter {
    #[serde(default)]
    pub t: String,
    #[serde(default)]
    pub ty: String,
}
