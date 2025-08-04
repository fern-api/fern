use crate::migration_status::MigrationStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Migration {
    pub name: String,
    pub status: MigrationStatus,
}