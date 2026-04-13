pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Page2 {
    /// The current page
    #[serde(default)]
    pub page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NextPage2>,
    #[serde(default)]
    pub per_page: i64,
    #[serde(default)]
    pub total_page: i64,
}

impl Page2 {
    pub fn builder() -> Page2Builder {
        <Page2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Page2Builder {
    page: Option<i64>,
    next: Option<NextPage2>,
    per_page: Option<i64>,
    total_page: Option<i64>,
}

impl Page2Builder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn next(mut self, value: NextPage2) -> Self {
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

    /// Consumes the builder and constructs a [`Page2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](Page2Builder::page)
    /// - [`per_page`](Page2Builder::per_page)
    /// - [`total_page`](Page2Builder::total_page)
    pub fn build(self) -> Result<Page2, BuildError> {
        Ok(Page2 {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            next: self.next,
            per_page: self.per_page.ok_or_else(|| BuildError::missing_field("per_page"))?,
            total_page: self.total_page.ok_or_else(|| BuildError::missing_field("total_page"))?,
        })
    }
}
