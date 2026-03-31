pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NextPage2 {
    #[serde(default)]
    pub page: i64,
    #[serde(default)]
    pub starting_after: String,
}

impl NextPage2 {
    pub fn builder() -> NextPage2Builder {
        <NextPage2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NextPage2Builder {
    page: Option<i64>,
    starting_after: Option<String>,
}

impl NextPage2Builder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NextPage2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](NextPage2Builder::page)
    /// - [`starting_after`](NextPage2Builder::starting_after)
    pub fn build(self) -> Result<NextPage2, BuildError> {
        Ok(NextPage2 {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            starting_after: self.starting_after.ok_or_else(|| BuildError::missing_field("starting_after"))?,
        })
    }
}
