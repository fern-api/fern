pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MapOfDocumentedUnknownType(pub HashMap<String, DocumentedUnknownType>);