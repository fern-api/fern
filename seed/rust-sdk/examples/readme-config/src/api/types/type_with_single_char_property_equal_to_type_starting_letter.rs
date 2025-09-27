use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypeWithSingleCharPropertyEqualToTypeStartingLetter {
    pub t: String,
    pub ty: String,
}
