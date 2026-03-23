pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListPage {
    #[serde(default)]
    pub data: UserOptionalListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}

impl UserOptionalListPage {
    pub fn builder() -> UserOptionalListPageBuilder {
        UserOptionalListPageBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOptionalListPageBuilder {
    data: Option<UserOptionalListContainer>,
    next: Option<Uuid>,
}

impl UserOptionalListPageBuilder {
    pub fn data(mut self, value: UserOptionalListContainer) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: Uuid) -> Self {
        self.next = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOptionalListPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UserOptionalListPageBuilder::data)
    pub fn build(self) -> Result<UserOptionalListPage, BuildError> {
        Ok(UserOptionalListPage {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
