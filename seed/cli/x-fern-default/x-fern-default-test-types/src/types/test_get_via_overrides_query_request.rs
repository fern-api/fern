pub use crate::prelude::*;
use super::*;

/// Query parameters for test_get_via_overrides
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestGetViaOverridesQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<String>,
}

impl TestGetViaOverridesQueryRequest {
    pub fn builder() -> TestGetViaOverridesQueryRequestBuilder {
        <TestGetViaOverridesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestGetViaOverridesQueryRequestBuilder {
    limit: Option<String>,
}

impl TestGetViaOverridesQueryRequestBuilder {
    pub fn limit(mut self, value: impl Into<String>) -> Self {
        self.limit = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestGetViaOverridesQueryRequest`].
    pub fn build(self) -> Result<TestGetViaOverridesQueryRequest, BuildError> {
        Ok(TestGetViaOverridesQueryRequest {
            limit: self.limit,
        })
    }
}

