pub use crate::prelude::*;

/// Query parameters for test
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestQueryRequest {
    #[serde(default)]
    pub r#for: String,
}

impl TestQueryRequest {
    pub fn builder() -> TestQueryRequestBuilder {
        TestQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestQueryRequestBuilder {
    r#for: Option<String>,
}

impl TestQueryRequestBuilder {
    pub fn r#for(mut self, value: impl Into<String>) -> Self {
        self.r#for = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#for`](TestQueryRequestBuilder::r#for)
    pub fn build(self) -> Result<TestQueryRequest, BuildError> {
        Ok(TestQueryRequest {
            r#for: self.r#for.ok_or_else(|| BuildError::missing_field("r#for"))?,
        })
    }
}

