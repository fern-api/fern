pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NextPage {
    #[serde(default)]
    pub page: i64,
    #[serde(default)]
    pub starting_after: String,
}

impl NextPage {
    pub fn builder() -> NextPageBuilder {
        NextPageBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NextPageBuilder {
    page: Option<i64>,
    starting_after: Option<String>,
}

impl NextPageBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NextPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](NextPageBuilder::page)
    /// - [`starting_after`](NextPageBuilder::starting_after)
    pub fn build(self) -> Result<NextPage, BuildError> {
        Ok(NextPage {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            starting_after: self
                .starting_after
                .ok_or_else(|| BuildError::missing_field("starting_after"))?,
        })
    }
}
