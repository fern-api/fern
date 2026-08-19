pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TreeIdentifiable {
    /// Unique tree identifier.
    #[serde(default)]
    pub id: String,
}

impl TreeIdentifiable {
    pub fn builder() -> TreeIdentifiableBuilder {
        <TreeIdentifiableBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeIdentifiableBuilder {
    id: Option<String>,
}

impl TreeIdentifiableBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TreeIdentifiable`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TreeIdentifiableBuilder::id)
    pub fn build(self) -> Result<TreeIdentifiable, BuildError> {
        Ok(TreeIdentifiable {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
