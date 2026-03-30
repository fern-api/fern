pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithPage2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}

impl WithPage2 {
    pub fn builder() -> WithPage2Builder {
        <WithPage2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithPage2Builder {
    page: Option<i64>,
}

impl WithPage2Builder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithPage2`].
    pub fn build(self) -> Result<WithPage2, BuildError> {
        Ok(WithPage2 {
            page: self.page,
        })
    }
}
