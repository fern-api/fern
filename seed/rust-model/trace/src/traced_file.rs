use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TracedFile {
    pub filename: String,
    pub directory: String,
}