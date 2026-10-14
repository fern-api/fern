pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ShipmentDestination {
    #[serde(default)]
    pub line1: String,
    #[serde(default)]
    pub city: String,
}

impl ShipmentDestination {
    pub fn builder() -> ShipmentDestinationBuilder {
        <ShipmentDestinationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ShipmentDestinationBuilder {
    line1: Option<String>,
    city: Option<String>,
}

impl ShipmentDestinationBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ShipmentDestination`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](ShipmentDestinationBuilder::line1)
    /// - [`city`](ShipmentDestinationBuilder::city)
    pub fn build(self) -> Result<ShipmentDestination, BuildError> {
        Ok(ShipmentDestination {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
        })
    }
}
