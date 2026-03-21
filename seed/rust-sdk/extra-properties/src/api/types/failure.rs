pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Failure {
    pub status: String,
}

impl Failure {
    pub fn builder() -> FailureBuilder {
        FailureBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FailureBuilder {
    status: Option<String>,
}

impl FailureBuilder {
    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Failure`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](FailureBuilder::status)
    pub fn build(self) -> Result<Failure, BuildError> {
        Ok(Failure {
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
