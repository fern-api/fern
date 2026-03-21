pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameCursor {
    #[serde(default)]
    pub cursor: UsernamePage,
}
