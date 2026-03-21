pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserPage2 {
    #[serde(default)]
    pub data: UserListContainer2,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}

impl UserPage2 {
    pub fn builder() -> UserPage2Builder {
        UserPage2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserPage2Builder {
    data: Option<UserListContainer2>,
    next: Option<Uuid>,
}

impl UserPage2Builder {
    pub fn data(mut self, value: UserListContainer2) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: Uuid) -> Self {
        self.next = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserPage2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UserPage2Builder::data)
    pub fn build(self) -> Result<UserPage2, BuildError> {
        Ok(UserPage2 {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
