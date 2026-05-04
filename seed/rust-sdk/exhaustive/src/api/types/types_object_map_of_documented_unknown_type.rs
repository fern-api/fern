pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct MapOfDocumentedUnknownType(pub HashMap<String, DocumentedUnknownType>);
