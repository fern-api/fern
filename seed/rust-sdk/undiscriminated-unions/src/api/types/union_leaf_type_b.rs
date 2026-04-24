pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct LeafTypeB {
    pub gamma: String,
}

impl LeafTypeB {
    pub fn builder() -> LeafTypeBBuilder {
        <LeafTypeBBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LeafTypeBBuilder {
    gamma: Option<String>,
}

impl LeafTypeBBuilder {
    pub fn gamma(mut self, value: impl Into<String>) -> Self {
        self.gamma = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`LeafTypeB`].
    /// This method will fail if any of the following fields are not set:
    /// - [`gamma`](LeafTypeBBuilder::gamma)
    pub fn build(self) -> Result<LeafTypeB, BuildError> {
        Ok(LeafTypeB {
            gamma: self
                .gamma
                .ok_or_else(|| BuildError::missing_field("gamma"))?,
        })
    }
}
