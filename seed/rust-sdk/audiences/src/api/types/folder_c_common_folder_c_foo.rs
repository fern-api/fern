pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderCFoo {
    #[serde(default)]
    pub bar_property: Uuid,
}
