use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StuntDouble {
    pub name: String,
    #[serde(rename = "actorOrActressId")]
    pub actor_or_actress_id: String,
}