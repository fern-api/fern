pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StuntDouble {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "actorOrActressId")]
    #[serde(default)]
    pub actor_or_actress_id: String,
}