pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesStuntDouble {
    pub name: String,
    #[serde(rename = "actorOrActressId")]
    pub actor_or_actress_id: String,
}