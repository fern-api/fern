pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUser {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: i64,
}

impl InlineUsersUser {
    pub fn builder() -> InlineUsersUserBuilder {
        <InlineUsersUserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUserBuilder {
    name: Option<String>,
    id: Option<i64>,
}

impl InlineUsersUserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: i64) -> Self {
        self.id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUser`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](InlineUsersUserBuilder::name)
    /// - [`id`](InlineUsersUserBuilder::id)
    pub fn build(self) -> Result<InlineUsersUser, BuildError> {
        Ok(InlineUsersUser {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
