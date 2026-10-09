pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateItemRequest {
    #[serde(default)]
    pub name: String,
}

impl CreateItemRequest {
    pub fn builder() -> CreateItemRequestBuilder {
        <CreateItemRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateItemRequestBuilder {
    name: Option<String>,
}

impl CreateItemRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateItemRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CreateItemRequestBuilder::name)
    pub fn build(self) -> Result<CreateItemRequest, BuildError> {
        Ok(CreateItemRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}

