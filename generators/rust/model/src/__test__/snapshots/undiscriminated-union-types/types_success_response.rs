pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SuccessResponse {
    #[serde(default)]
    pub data: String,
    #[serde(default)]
    pub status: i64,
}

impl SuccessResponse {
    pub fn builder() -> SuccessResponseBuilder {
        SuccessResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SuccessResponseBuilder {
    data: Option<String>,
    status: Option<i64>,
}

impl SuccessResponseBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    pub fn status(mut self, value: i64) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SuccessResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](SuccessResponseBuilder::data)
    /// - [`status`](SuccessResponseBuilder::status)
    pub fn build(self) -> Result<SuccessResponse, BuildError> {
        Ok(SuccessResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
