pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HealthSystemResponse {
    #[serde(default)]
    pub status: String,
}

impl HealthSystemResponse {
    pub fn builder() -> HealthSystemResponseBuilder {
        <HealthSystemResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HealthSystemResponseBuilder {
    status: Option<String>,
}

impl HealthSystemResponseBuilder {
    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HealthSystemResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](HealthSystemResponseBuilder::status)
    pub fn build(self) -> Result<HealthSystemResponse, BuildError> {
        Ok(HealthSystemResponse {
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
