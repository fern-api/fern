pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestGetViaOverridesResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl TestGetViaOverridesResponse {
    pub fn builder() -> TestGetViaOverridesResponseBuilder {
        <TestGetViaOverridesResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestGetViaOverridesResponseBuilder {
    message: Option<String>,
}

impl TestGetViaOverridesResponseBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TestGetViaOverridesResponse`].
    pub fn build(self) -> Result<TestGetViaOverridesResponse, BuildError> {
        Ok(TestGetViaOverridesResponse {
            message: self.message,
        })
    }
}
