pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Shipment {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub destination: Option<ShipmentDestination>,
}

impl Shipment {
    pub fn builder() -> ShipmentBuilder {
        <ShipmentBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ShipmentBuilder {
    id: Option<String>,
    destination: Option<ShipmentDestination>,
}

impl ShipmentBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn destination(mut self, value: ShipmentDestination) -> Self {
        self.destination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Shipment`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ShipmentBuilder::id)
    pub fn build(self) -> Result<Shipment, BuildError> {
        Ok(Shipment {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            destination: self.destination,
        })
    }
}
