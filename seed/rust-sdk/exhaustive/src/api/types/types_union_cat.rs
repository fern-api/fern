pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesUnionCat {
    pub name: String,
    #[serde(rename = "likesToMeow")]
    pub likes_to_meow: bool,
}
