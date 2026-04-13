pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersWithPage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}

impl InlineUsersWithPage {
    pub fn builder() -> InlineUsersWithPageBuilder {
        <InlineUsersWithPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersWithPageBuilder {
    page: Option<i64>,
}

impl InlineUsersWithPageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersWithPage`].
    pub fn build(self) -> Result<InlineUsersWithPage, BuildError> {
        Ok(InlineUsersWithPage {
            page: self.page,
        })
    }
}
