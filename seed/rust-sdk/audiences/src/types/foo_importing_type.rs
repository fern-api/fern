use crate::commons_imported::Imported;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ImportingType {
    pub imported: Imported,
}
