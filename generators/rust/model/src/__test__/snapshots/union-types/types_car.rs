pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesCar {
    pub doors: i64,
    pub fuel_type: String,
}