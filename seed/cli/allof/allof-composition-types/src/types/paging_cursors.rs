pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PagingCursors {
    /// Cursor for the next page of results.
    #[serde(default)]
    pub next: String,
    /// Cursor for the previous page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub previous: Option<String>,
}

impl PagingCursors {
    pub fn builder() -> PagingCursorsBuilder {
        <PagingCursorsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PagingCursorsBuilder {
    next: Option<String>,
    previous: Option<String>,
}

impl PagingCursorsBuilder {
    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    pub fn previous(mut self, value: impl Into<String>) -> Self {
        self.previous = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PagingCursors`].
    /// This method will fail if any of the following fields are not set:
    /// - [`next`](PagingCursorsBuilder::next)
    pub fn build(self) -> Result<PagingCursors, BuildError> {
        Ok(PagingCursors {
            next: self.next.ok_or_else(|| BuildError::missing_field("next"))?,
            previous: self.previous,
        })
    }
}
