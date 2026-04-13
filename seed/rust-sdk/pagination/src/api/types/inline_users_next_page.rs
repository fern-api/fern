pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersNextPage {
    #[serde(default)]
    pub page: i64,
    #[serde(default)]
    pub starting_after: String,
}

impl InlineUsersNextPage {
    pub fn builder() -> InlineUsersNextPageBuilder {
        <InlineUsersNextPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersNextPageBuilder {
    page: Option<i64>,
    starting_after: Option<String>,
}

impl InlineUsersNextPageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersNextPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](InlineUsersNextPageBuilder::page)
    /// - [`starting_after`](InlineUsersNextPageBuilder::starting_after)
    pub fn build(self) -> Result<InlineUsersNextPage, BuildError> {
        Ok(InlineUsersNextPage {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            starting_after: self
                .starting_after
                .ok_or_else(|| BuildError::missing_field("starting_after"))?,
        })
    }
}
