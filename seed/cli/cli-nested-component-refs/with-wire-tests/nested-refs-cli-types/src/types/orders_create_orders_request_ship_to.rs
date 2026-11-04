pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrdersRequestShipTo {
    #[serde(default)]
    pub line1: String,
    #[serde(default)]
    pub city: String,
}

impl CreateOrdersRequestShipTo {
    pub fn builder() -> CreateOrdersRequestShipToBuilder {
        <CreateOrdersRequestShipToBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateOrdersRequestShipToBuilder {
    line1: Option<String>,
    city: Option<String>,
}

impl CreateOrdersRequestShipToBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateOrdersRequestShipTo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](CreateOrdersRequestShipToBuilder::line1)
    /// - [`city`](CreateOrdersRequestShipToBuilder::city)
    pub fn build(self) -> Result<CreateOrdersRequestShipTo, BuildError> {
        Ok(CreateOrdersRequestShipTo {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
        })
    }
}
