pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateShipmentsRequest {
    #[serde(default)]
    pub destination: CreateShipmentsRequestDestination,
    #[serde(default)]
    pub items: Vec<CreateShipmentsRequestItemsItem>,
}

impl CreateShipmentsRequest {
    pub fn builder() -> CreateShipmentsRequestBuilder {
        <CreateShipmentsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateShipmentsRequestBuilder {
    destination: Option<CreateShipmentsRequestDestination>,
    items: Option<Vec<CreateShipmentsRequestItemsItem>>,
}

impl CreateShipmentsRequestBuilder {
    pub fn destination(mut self, value: CreateShipmentsRequestDestination) -> Self {
        self.destination = Some(value);
        self
    }

    pub fn items(mut self, value: Vec<CreateShipmentsRequestItemsItem>) -> Self {
        self.items = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateShipmentsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`destination`](CreateShipmentsRequestBuilder::destination)
    /// - [`items`](CreateShipmentsRequestBuilder::items)
    pub fn build(self) -> Result<CreateShipmentsRequest, BuildError> {
        Ok(CreateShipmentsRequest {
            destination: self.destination.ok_or_else(|| BuildError::missing_field("destination"))?,
            items: self.items.ok_or_else(|| BuildError::missing_field("items"))?,
        })
    }
}

