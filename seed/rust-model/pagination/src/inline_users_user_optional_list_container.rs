pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUserOptionalListContainer {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub users: Option<Vec<InlineUsersUser>>,
}

impl InlineUsersUserOptionalListContainer {
    pub fn builder() -> InlineUsersUserOptionalListContainerBuilder {
        <InlineUsersUserOptionalListContainerBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUserOptionalListContainerBuilder {
    users: Option<Vec<InlineUsersUser>>,
}

impl InlineUsersUserOptionalListContainerBuilder {
    pub fn users(mut self, value: Vec<InlineUsersUser>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUserOptionalListContainer`].
    pub fn build(self) -> Result<InlineUsersUserOptionalListContainer, BuildError> {
        Ok(InlineUsersUserOptionalListContainer {
            users: self.users,
        })
    }
}
