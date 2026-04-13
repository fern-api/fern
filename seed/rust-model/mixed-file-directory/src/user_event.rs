pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserEvent {
    #[serde(default)]
    pub id: Id,
    #[serde(default)]
    pub name: String,
}

impl UserEvent {
    pub fn builder() -> UserEventBuilder {
        <UserEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserEventBuilder {
    id: Option<Id>,
    name: Option<String>,
}

impl UserEventBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserEventBuilder::id)
    /// - [`name`](UserEventBuilder::name)
    pub fn build(self) -> Result<UserEvent, BuildError> {
        Ok(UserEvent {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
