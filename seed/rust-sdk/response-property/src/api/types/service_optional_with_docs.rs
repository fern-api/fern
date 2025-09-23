use crate::service_with_docs::WithDocs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OptionalWithDocs(pub Option<WithDocs>);
