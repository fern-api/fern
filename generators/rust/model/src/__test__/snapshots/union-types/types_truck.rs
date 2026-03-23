pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Truck {
    #[serde(default)]
    pub payload_capacity: f64,
    #[serde(default)]
    pub axles: i64,
}

impl Truck {
    pub fn builder() -> TruckBuilder {
        TruckBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TruckBuilder {
    payload_capacity: Option<f64>,
    axles: Option<i64>,
}

impl TruckBuilder {
    pub fn payload_capacity(mut self, value: f64) -> Self {
        self.payload_capacity = Some(value);
        self
    }

    pub fn axles(mut self, value: i64) -> Self {
        self.axles = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Truck`].
    /// This method will fail if any of the following fields are not set:
    /// - [`payload_capacity`](TruckBuilder::payload_capacity)
    /// - [`axles`](TruckBuilder::axles)
    pub fn build(self) -> Result<Truck, BuildError> {
        Ok(Truck {
            payload_capacity: self.payload_capacity.ok_or_else(|| BuildError::missing_field("payload_capacity"))?,
            axles: self.axles.ok_or_else(|| BuildError::missing_field("axles"))?,
        })
    }
}
