pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersPage {
    /// The current page
    #[serde(default)]
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<InlineUsersNextPage>,
    #[serde(default)]
    pub per_page: i64,
    #[serde(default)]
    pub total_page: i64,
}

impl InlineUsersPage {
    pub fn builder() -> InlineUsersPageBuilder {
        <InlineUsersPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersPageBuilder {
    page: Option<i64>,
    next: Option<InlineUsersNextPage>,
    per_page: Option<i64>,
    total_page: Option<i64>,
}

impl InlineUsersPageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn next(mut self, value: InlineUsersNextPage) -> Self {
        self.next = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn total_page(mut self, value: i64) -> Self {
        self.total_page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](InlineUsersPageBuilder::page)
    /// - [`per_page`](InlineUsersPageBuilder::per_page)
    /// - [`total_page`](InlineUsersPageBuilder::total_page)
    pub fn build(self) -> Result<InlineUsersPage, BuildError> {
        Ok(InlineUsersPage {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            next: self.next,
            per_page: self
                .per_page
                .ok_or_else(|| BuildError::missing_field("per_page"))?,
            total_page: self
                .total_page
                .ok_or_else(|| BuildError::missing_field("total_page"))?,
        })
    }
}
