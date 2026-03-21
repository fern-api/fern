pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BadObjectRequestInfo {
    #[serde(default)]
    pub message: String,
}

impl BadObjectRequestInfo {
    pub fn builder() -> BadObjectRequestInfoBuilder {
        BadObjectRequestInfoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BadObjectRequestInfoBuilder {
    message: Option<String>,
}

impl BadObjectRequestInfoBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BadObjectRequestInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](BadObjectRequestInfoBuilder::message)
    pub fn build(self) -> Result<BadObjectRequestInfo, BuildError> {
        Ok(BadObjectRequestInfo {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
