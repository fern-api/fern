pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestGetResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl TestGetResponse {
    pub fn builder() -> TestGetResponseBuilder {
        <TestGetResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestGetResponseBuilder {
    message: Option<String>,
}

impl TestGetResponseBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestGetResponse`].
    pub fn build(self) -> Result<TestGetResponse, BuildError> {
        Ok(TestGetResponse {
            message: self.message,
        })
    }
}
