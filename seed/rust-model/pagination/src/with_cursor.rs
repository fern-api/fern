pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithCursor {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl WithCursor {
    pub fn builder() -> WithCursorBuilder {
        <WithCursorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithCursorBuilder {
    cursor: Option<String>,
}

impl WithCursorBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WithCursor`].
    pub fn build(self) -> Result<WithCursor, BuildError> {
        Ok(WithCursor {
            cursor: self.cursor,
        })
    }
}
