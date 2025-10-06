pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnionMetadata(pub HashMap<UnionKey, String>);
