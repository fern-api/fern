pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Actress {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: String,
}

impl Actress {
    pub fn builder() -> ActressBuilder {
        ActressBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActressBuilder {
    name: Option<String>,
    id: Option<String>,
}

impl ActressBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Actress`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](ActressBuilder::name)
    /// - [`id`](ActressBuilder::id)
    pub fn build(self) -> Result<Actress, BuildError> {
        Ok(Actress {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
