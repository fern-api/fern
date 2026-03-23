pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User2 {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: i64,
}

impl User2 {
    pub fn builder() -> User2Builder {
        User2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct User2Builder {
    name: Option<String>,
    id: Option<i64>,
}

impl User2Builder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: i64) -> Self {
        self.id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](User2Builder::name)
    /// - [`id`](User2Builder::id)
    pub fn build(self) -> Result<User2, BuildError> {
        Ok(User2 {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
