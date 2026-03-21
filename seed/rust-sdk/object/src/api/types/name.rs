pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Name {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub value: String,
}

impl Name {
    pub fn builder() -> NameBuilder {
        NameBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NameBuilder {
    id: Option<String>,
    value: Option<String>,
}

impl NameBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Name`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](NameBuilder::id)
    /// - [`value`](NameBuilder::value)
    pub fn build(self) -> Result<Name, BuildError> {
        Ok(Name {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
