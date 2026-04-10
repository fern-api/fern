pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUserOptionalListPage {
    #[serde(default)]
    pub data: InlineUsersUserOptionalListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl InlineUsersUserOptionalListPage {
    pub fn builder() -> InlineUsersUserOptionalListPageBuilder {
        <InlineUsersUserOptionalListPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUserOptionalListPageBuilder {
    data: Option<InlineUsersUserOptionalListContainer>,
    next: Option<String>,
}

impl InlineUsersUserOptionalListPageBuilder {
    pub fn data(mut self, value: InlineUsersUserOptionalListContainer) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUserOptionalListPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](InlineUsersUserOptionalListPageBuilder::data)
    pub fn build(self) -> Result<InlineUsersUserOptionalListPage, BuildError> {
        Ok(InlineUsersUserOptionalListPage {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
