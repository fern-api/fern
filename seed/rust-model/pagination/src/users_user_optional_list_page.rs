pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListPage2 {
    #[serde(default)]
    pub data: UserOptionalListContainer2,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}

impl UserOptionalListPage2 {
    pub fn builder() -> UserOptionalListPage2Builder {
        <UserOptionalListPage2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOptionalListPage2Builder {
    data: Option<UserOptionalListContainer2>,
    next: Option<Uuid>,
}

impl UserOptionalListPage2Builder {
    pub fn data(mut self, value: UserOptionalListContainer2) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: Uuid) -> Self {
        self.next = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOptionalListPage2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UserOptionalListPage2Builder::data)
    pub fn build(self) -> Result<UserOptionalListPage2, BuildError> {
        Ok(UserOptionalListPage2 {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
