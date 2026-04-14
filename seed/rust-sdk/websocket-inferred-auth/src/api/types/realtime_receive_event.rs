pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent {
    #[serde(default)]
    pub alpha: String,
    #[serde(default)]
    pub beta: i64,
}

impl ReceiveEvent {
    pub fn builder() -> ReceiveEventBuilder {
        <ReceiveEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ReceiveEventBuilder {
    alpha: Option<String>,
    beta: Option<i64>,
}

impl ReceiveEventBuilder {
    pub fn alpha(mut self, value: impl Into<String>) -> Self {
        self.alpha = Some(value.into());
        self
    }

    pub fn beta(mut self, value: i64) -> Self {
        self.beta = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ReceiveEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`alpha`](ReceiveEventBuilder::alpha)
    /// - [`beta`](ReceiveEventBuilder::beta)
    pub fn build(self) -> Result<ReceiveEvent, BuildError> {
        Ok(ReceiveEvent {
            alpha: self
                .alpha
                .ok_or_else(|| BuildError::missing_field("alpha"))?,
            beta: self.beta.ok_or_else(|| BuildError::missing_field("beta"))?,
        })
    }
}
