use serde::{Deserialize, Serialize};
use crate::migration_status::MigrationStatus;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Migration {
    pub name: String,
    pub status: MigrationStatus,
}