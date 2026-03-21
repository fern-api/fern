pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TriangularRepair {
    #[serde(default)]
    pub value: String,
}

impl TriangularRepair {
    pub fn builder() -> TriangularRepairBuilder {
        TriangularRepairBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TriangularRepairBuilder {
    value: Option<String>,
}

impl TriangularRepairBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TriangularRepair`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](TriangularRepairBuilder::value)
    pub fn build(self) -> Result<TriangularRepair, BuildError> {
        Ok(TriangularRepair {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
