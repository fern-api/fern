pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithPage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}

impl WithPage {
    pub fn builder() -> WithPageBuilder {
        <WithPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithPageBuilder {
    page: Option<i64>,
}

impl WithPageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithPage`].
    pub fn build(self) -> Result<WithPage, BuildError> {
        Ok(WithPage {
            page: self.page,
        })
    }
}
