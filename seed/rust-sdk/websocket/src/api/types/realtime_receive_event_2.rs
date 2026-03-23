pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent2 {
    #[serde(default)]
    pub gamma: String,
    #[serde(default)]
    pub delta: i64,
    #[serde(default)]
    pub epsilon: bool,
}

impl ReceiveEvent2 {
    pub fn builder() -> ReceiveEvent2Builder {
        ReceiveEvent2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ReceiveEvent2Builder {
    gamma: Option<String>,
    delta: Option<i64>,
    epsilon: Option<bool>,
}

impl ReceiveEvent2Builder {
    pub fn gamma(mut self, value: impl Into<String>) -> Self {
        self.gamma = Some(value.into());
        self
    }

    pub fn delta(mut self, value: i64) -> Self {
        self.delta = Some(value);
        self
    }

    pub fn epsilon(mut self, value: bool) -> Self {
        self.epsilon = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ReceiveEvent2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`gamma`](ReceiveEvent2Builder::gamma)
    /// - [`delta`](ReceiveEvent2Builder::delta)
    /// - [`epsilon`](ReceiveEvent2Builder::epsilon)
    pub fn build(self) -> Result<ReceiveEvent2, BuildError> {
        Ok(ReceiveEvent2 {
            gamma: self.gamma.ok_or_else(|| BuildError::missing_field("gamma"))?,
            delta: self.delta.ok_or_else(|| BuildError::missing_field("delta"))?,
            epsilon: self.epsilon.ok_or_else(|| BuildError::missing_field("epsilon"))?,
        })
    }
}
