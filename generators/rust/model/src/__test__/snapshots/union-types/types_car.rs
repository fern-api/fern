pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Car {
    #[serde(default)]
    pub doors: i64,
    #[serde(default)]
    pub fuel_type: String,
}

impl Car {
    pub fn builder() -> CarBuilder {
        CarBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CarBuilder {
    doors: Option<i64>,
    fuel_type: Option<String>,
}

impl CarBuilder {
    pub fn doors(mut self, value: i64) -> Self {
        self.doors = Some(value);
        self
    }

    pub fn fuel_type(mut self, value: impl Into<String>) -> Self {
        self.fuel_type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Car`].
    /// This method will fail if any of the following fields are not set:
    /// - [`doors`](CarBuilder::doors)
    /// - [`fuel_type`](CarBuilder::fuel_type)
    pub fn build(self) -> Result<Car, BuildError> {
        Ok(Car {
            doors: self.doors.ok_or_else(|| BuildError::missing_field("doors"))?,
            fuel_type: self.fuel_type.ok_or_else(|| BuildError::missing_field("fuel_type"))?,
        })
    }
}
