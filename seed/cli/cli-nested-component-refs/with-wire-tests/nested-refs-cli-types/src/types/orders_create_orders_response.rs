pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrdersResponse {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub status: String,
}

impl CreateOrdersResponse {
    pub fn builder() -> CreateOrdersResponseBuilder {
        <CreateOrdersResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateOrdersResponseBuilder {
    id: Option<String>,
    status: Option<String>,
}

impl CreateOrdersResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateOrdersResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CreateOrdersResponseBuilder::id)
    /// - [`status`](CreateOrdersResponseBuilder::status)
    pub fn build(self) -> Result<CreateOrdersResponse, BuildError> {
        Ok(CreateOrdersResponse {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
