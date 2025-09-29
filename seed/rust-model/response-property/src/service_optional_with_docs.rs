use serde::{Deserialize, Serialize};
use crate::service_with_docs::WithDocs;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OptionalWithDocs(pub Option<WithDocs>);