use serde::{Deserialize, Serialize};
use crate::with_docs::WithDocs;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OptionalWithDocs(pub Option<WithDocs>);