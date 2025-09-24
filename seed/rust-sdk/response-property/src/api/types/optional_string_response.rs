use crate::string_response::StringResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OptionalStringResponse(pub Option<StringResponse>);
