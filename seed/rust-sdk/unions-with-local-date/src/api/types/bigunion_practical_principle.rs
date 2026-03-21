pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PracticalPrinciple {
    #[serde(default)]
    pub value: String,
}

impl PracticalPrinciple {
    pub fn builder() -> PracticalPrincipleBuilder {
        PracticalPrincipleBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PracticalPrincipleBuilder {
    value: Option<String>,
}

impl PracticalPrincipleBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PracticalPrinciple`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](PracticalPrincipleBuilder::value)
    pub fn build(self) -> Result<PracticalPrinciple, BuildError> {
        Ok(PracticalPrinciple {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
