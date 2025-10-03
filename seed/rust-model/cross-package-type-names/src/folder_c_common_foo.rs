pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FolderCCommonFoo {
    pub bar_property: Uuid,
}
