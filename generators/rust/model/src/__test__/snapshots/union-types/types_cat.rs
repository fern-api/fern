pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesCat {
    pub name: String,
    pub is_indoor: bool,
    pub lives_remaining: i64,
}