pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TotalWork {
    #[serde(default)]
    pub value: String,
}

impl TotalWork {
    pub fn builder() -> TotalWorkBuilder {
        TotalWorkBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TotalWorkBuilder {
    value: Option<String>,
}

impl TotalWorkBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TotalWork`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](TotalWorkBuilder::value)
    pub fn build(self) -> Result<TotalWork, BuildError> {
        Ok(TotalWork {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
