pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StatusResponse {
    #[serde(default)]
    pub status: String,
}

impl StatusResponse {
    pub fn builder() -> StatusResponseBuilder {
        <StatusResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StatusResponseBuilder {
    status: Option<String>,
}

impl StatusResponseBuilder {
    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StatusResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](StatusResponseBuilder::status)
    pub fn build(self) -> Result<StatusResponse, BuildError> {
        Ok(StatusResponse {
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
