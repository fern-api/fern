pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Circle {
    #[serde(default)]
    pub radius: f64,
}

impl Circle {
    pub fn builder() -> CircleBuilder {
        CircleBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CircleBuilder {
    radius: Option<f64>,
}

impl CircleBuilder {
    pub fn radius(mut self, value: f64) -> Self {
        self.radius = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Circle`].
    /// This method will fail if any of the following fields are not set:
    /// - [`radius`](CircleBuilder::radius)
    pub fn build(self) -> Result<Circle, BuildError> {
        Ok(Circle {
            radius: self.radius.ok_or_else(|| BuildError::missing_field("radius"))?,
        })
    }
}
