use serde::{Deserialize, Serialize};
use crate::string_response::StringResponse;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OptionalStringResponse(pub Option<StringResponse>);