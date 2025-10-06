pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesMigration {
    pub name: String,
    pub status: TypesMigrationStatus,
}