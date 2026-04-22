pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserPage {
    #[serde(default)]
    pub data: UserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}

impl UserPage {
    pub fn builder() -> UserPageBuilder {
        <UserPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserPageBuilder {
    data: Option<UserListContainer>,
    next: Option<Uuid>,
}

impl UserPageBuilder {
    pub fn data(mut self, value: UserListContainer) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: Uuid) -> Self {
        self.next = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UserPageBuilder::data)
    pub fn build(self) -> Result<UserPage, BuildError> {
        Ok(UserPage {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
