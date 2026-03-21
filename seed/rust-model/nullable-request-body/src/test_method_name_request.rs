pub use crate::prelude::*;

/// Request for test_method_name (body + query parameters)
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestMethodNameRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_object: Option<PlainObject>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query_param_integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<PlainObject>,
}

impl TestMethodNameRequest {
    pub fn builder() -> TestMethodNameRequestBuilder {
        TestMethodNameRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestMethodNameRequestBuilder {
    query_param_object: Option<PlainObject>,
    query_param_integer: Option<i64>,
    body: Option<PlainObject>,
}

impl TestMethodNameRequestBuilder {
    pub fn query_param_object(mut self, value: PlainObject) -> Self {
        self.query_param_object = Some(value);
        self
    }

    pub fn query_param_integer(mut self, value: i64) -> Self {
        self.query_param_integer = Some(value);
        self
    }

    pub fn body(mut self, value: PlainObject) -> Self {
        self.body = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestMethodNameRequest`].
    pub fn build(self) -> Result<TestMethodNameRequest, BuildError> {
        Ok(TestMethodNameRequest {
            query_param_object: self.query_param_object,
            query_param_integer: self.query_param_integer,
            body: self.body,
        })
    }
}

