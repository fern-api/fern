pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StartingAfterPaging {
    #[serde(default)]
    pub per_page: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl StartingAfterPaging {
    pub fn builder() -> StartingAfterPagingBuilder {
        StartingAfterPagingBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StartingAfterPagingBuilder {
    per_page: Option<i64>,
    starting_after: Option<String>,
}

impl StartingAfterPagingBuilder {
    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StartingAfterPaging`].
    /// This method will fail if any of the following fields are not set:
    /// - [`per_page`](StartingAfterPagingBuilder::per_page)
    pub fn build(self) -> Result<StartingAfterPaging, BuildError> {
        Ok(StartingAfterPaging {
            per_page: self
                .per_page
                .ok_or_else(|| BuildError::missing_field("per_page"))?,
            starting_after: self.starting_after,
        })
    }
}
