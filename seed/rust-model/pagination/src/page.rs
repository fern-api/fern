pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Page {
    /// The current page
    #[serde(default)]
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage>,
    #[serde(default)]
    pub per_page: i64,
    #[serde(default)]
    pub total_page: i64,
}

impl Page {
    pub fn builder() -> PageBuilder {
        <PageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PageBuilder {
    page: Option<i64>,
    next: Option<NextPage>,
    per_page: Option<i64>,
    total_page: Option<i64>,
}

impl PageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn next(mut self, value: NextPage) -> Self {
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

    /// Consumes the builder and constructs a [`Page`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](PageBuilder::page)
    /// - [`per_page`](PageBuilder::per_page)
    /// - [`total_page`](PageBuilder::total_page)
    pub fn build(self) -> Result<Page, BuildError> {
        Ok(Page {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            next: self.next,
            per_page: self.per_page.ok_or_else(|| BuildError::missing_field("per_page"))?,
            total_page: self.total_page.ok_or_else(|| BuildError::missing_field("total_page"))?,
        })
    }
}
