pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Failure {
    pub status: FailureStatus,
}

impl Failure {
    pub fn builder() -> FailureBuilder {
        <FailureBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FailureBuilder {
    status: Option<FailureStatus>,
}

impl FailureBuilder {
    pub fn status(mut self, value: FailureStatus) -> Self {
        self.status = Some(value);
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
