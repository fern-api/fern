pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct MigrationMigration {
    pub name: String,
    pub status: MigrationMigrationStatus,
}