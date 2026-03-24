pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Motorcycle {
    #[serde(default)]
    pub engine_size: f64,
    #[serde(default)]
    pub has_sidecar: bool,
}

impl Motorcycle {
    pub fn builder() -> MotorcycleBuilder {
        MotorcycleBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MotorcycleBuilder {
    engine_size: Option<f64>,
    has_sidecar: Option<bool>,
}

impl MotorcycleBuilder {
    pub fn engine_size(mut self, value: f64) -> Self {
        self.engine_size = Some(value);
        self
    }

    pub fn has_sidecar(mut self, value: bool) -> Self {
        self.has_sidecar = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Motorcycle`].
    /// This method will fail if any of the following fields are not set:
    /// - [`engine_size`](MotorcycleBuilder::engine_size)
    /// - [`has_sidecar`](MotorcycleBuilder::has_sidecar)
    pub fn build(self) -> Result<Motorcycle, BuildError> {
        Ok(Motorcycle {
            engine_size: self.engine_size.ok_or_else(|| BuildError::missing_field("engine_size"))?,
            has_sidecar: self.has_sidecar.ok_or_else(|| BuildError::missing_field("has_sidecar"))?,
        })
    }
}
