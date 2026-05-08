pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct TypesMapOfDocumentedUnknownType(pub HashMap<String, TypesDocumentedUnknownType>);
