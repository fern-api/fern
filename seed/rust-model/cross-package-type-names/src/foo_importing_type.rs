pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ImportingType {
    #[serde(default)]
    pub imported: Imported,
}