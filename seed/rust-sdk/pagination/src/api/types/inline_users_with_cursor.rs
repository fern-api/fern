pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersWithCursor {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl InlineUsersWithCursor {
    pub fn builder() -> InlineUsersWithCursorBuilder {
        <InlineUsersWithCursorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersWithCursorBuilder {
    cursor: Option<String>,
}

impl InlineUsersWithCursorBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersWithCursor`].
    pub fn build(self) -> Result<InlineUsersWithCursor, BuildError> {
        Ok(InlineUsersWithCursor {
            cursor: self.cursor,
        })
    }
}
