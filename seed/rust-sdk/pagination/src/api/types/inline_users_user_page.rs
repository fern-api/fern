pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUserPage {
    #[serde(default)]
    pub data: InlineUsersUserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl InlineUsersUserPage {
    pub fn builder() -> InlineUsersUserPageBuilder {
        <InlineUsersUserPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUserPageBuilder {
    data: Option<InlineUsersUserListContainer>,
    next: Option<String>,
}

impl InlineUsersUserPageBuilder {
    pub fn data(mut self, value: InlineUsersUserListContainer) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUserPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](InlineUsersUserPageBuilder::data)
    pub fn build(self) -> Result<InlineUsersUserPage, BuildError> {
        Ok(InlineUsersUserPage {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
