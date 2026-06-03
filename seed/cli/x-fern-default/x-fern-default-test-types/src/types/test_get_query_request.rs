pub use crate::prelude::*;

/// Query parameters for test_get
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestGetQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<String>,
}

impl TestGetQueryRequest {
    pub fn builder() -> TestGetQueryRequestBuilder {
        <TestGetQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestGetQueryRequestBuilder {
    limit: Option<String>,
}

impl TestGetQueryRequestBuilder {
    pub fn limit(mut self, value: impl Into<String>) -> Self {
        self.limit = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestGetQueryRequest`].
    pub fn build(self) -> Result<TestGetQueryRequest, BuildError> {
        Ok(TestGetQueryRequest {
            limit: self.limit,
        })
    }
}

