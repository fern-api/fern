pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Identifiable {
    /// Unique identifier.
    #[serde(default)]
    pub id: String,
    /// Display name from Identifiable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl Identifiable {
    pub fn builder() -> IdentifiableBuilder {
        <IdentifiableBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IdentifiableBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl IdentifiableBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Identifiable`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](IdentifiableBuilder::id)
    pub fn build(self) -> Result<Identifiable, BuildError> {
        Ok(Identifiable {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name,
        })
    }
}
