pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Movie {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
}

impl Movie {
    pub fn builder() -> MovieBuilder {
        MovieBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MovieBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl MovieBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Movie`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MovieBuilder::id)
    /// - [`name`](MovieBuilder::name)
    pub fn build(self) -> Result<Movie, BuildError> {
        Ok(Movie {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
