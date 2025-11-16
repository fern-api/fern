pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestMethodNameRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_object: Option<Option<PlainObject>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_integer: Option<Option<i64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<PlainObject>,
}
