pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TriangularRepair {
    #[serde(default)]
    pub value: String,
}
