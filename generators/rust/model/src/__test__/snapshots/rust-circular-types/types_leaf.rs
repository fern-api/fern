pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Leaf {
    #[serde(default)]
    pub value: String,
}

impl Leaf {
    pub fn builder() -> LeafBuilder {
        <LeafBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LeafBuilder {
    value: Option<String>,
}

impl LeafBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Leaf`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](LeafBuilder::value)
    pub fn build(self) -> Result<Leaf, BuildError> {
        Ok(Leaf {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
