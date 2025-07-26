use crate::imported::Imported;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImportingType {
    pub imported: Imported,
}