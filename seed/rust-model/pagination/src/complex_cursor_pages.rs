pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CursorPages {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<StartingAfterPaging>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_pages: Option<i64>,
    pub r#type: String,
}

impl CursorPages {
    pub fn builder() -> CursorPagesBuilder {
        <CursorPagesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CursorPagesBuilder {
    next: Option<StartingAfterPaging>,
    page: Option<i64>,
    per_page: Option<i64>,
    total_pages: Option<i64>,
    r#type: Option<String>,
}

impl CursorPagesBuilder {
    pub fn next(mut self, value: StartingAfterPaging) -> Self {
        self.next = Some(value);
        self
    }

    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn total_pages(mut self, value: i64) -> Self {
        self.total_pages = Some(value);
        self
    }

    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CursorPages`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](CursorPagesBuilder::r#type)
    pub fn build(self) -> Result<CursorPages, BuildError> {
        Ok(CursorPages {
            next: self.next,
            page: self.page,
            per_page: self.per_page,
            total_pages: self.total_pages,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
