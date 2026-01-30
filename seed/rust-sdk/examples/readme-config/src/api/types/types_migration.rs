pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Migration {
    pub name: String,
    pub status: MigrationStatus,
}