pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameCursor {
    #[serde(default)]
    pub cursor: UsernamePage,
}

impl UsernameCursor {
    pub fn builder() -> UsernameCursorBuilder {
        <UsernameCursorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsernameCursorBuilder {
    cursor: Option<UsernamePage>,
}

impl UsernameCursorBuilder {
    pub fn cursor(mut self, value: UsernamePage) -> Self {
        self.cursor = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsernameCursor`].
    /// This method will fail if any of the following fields are not set:
    /// - [`cursor`](UsernameCursorBuilder::cursor)
    pub fn build(self) -> Result<UsernameCursor, BuildError> {
        Ok(UsernameCursor {
            cursor: self.cursor.ok_or_else(|| BuildError::missing_field("cursor"))?,
        })
    }
}
