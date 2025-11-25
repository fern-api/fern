pub use crate::prelude::*;

/// Request for test_method_name (body + query parameters)
///
/// Request type for the TestMethodNameRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestMethodNameRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_object: Option<Option<PlainObject>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_integer: Option<Option<i64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<PlainObject>,
}
