pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StreamEventDiscriminantInData {
    #[serde(rename = "group.created")]
    #[non_exhaustive]
    GroupCreated {
        #[serde(default)]
        offset: String,
        #[serde(default)]
        group_id: String,
    },

    #[serde(rename = "group.deleted")]
    #[non_exhaustive]
    GroupDeleted {
        #[serde(default)]
        offset: String,
        #[serde(default)]
        group_id: String,
    },
}

impl StreamEventDiscriminantInData {
    pub fn group_created(offset: String, group_id: String) -> Self {
        Self::GroupCreated { offset, group_id }
    }

    pub fn group_deleted(offset: String, group_id: String) -> Self {
        Self::GroupDeleted { offset, group_id }
    }
}
