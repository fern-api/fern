pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithCursor2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl WithCursor2 {
    pub fn builder() -> WithCursor2Builder {
        WithCursor2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithCursor2Builder {
    cursor: Option<String>,
}

impl WithCursor2Builder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WithCursor2`].
    pub fn build(self) -> Result<WithCursor2, BuildError> {
        Ok(WithCursor2 {
            cursor: self.cursor,
        })
    }
}
