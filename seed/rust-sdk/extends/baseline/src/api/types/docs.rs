pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Docs {
    #[serde(default)]
    pub docs: String,
}

impl Docs {
    pub fn builder() -> DocsBuilder {
        <DocsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DocsBuilder {
    docs: Option<String>,
}

impl DocsBuilder {
    pub fn docs(mut self, value: impl Into<String>) -> Self {
        self.docs = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Docs`].
    /// This method will fail if any of the following fields are not set:
    /// - [`docs`](DocsBuilder::docs)
    pub fn build(self) -> Result<Docs, BuildError> {
        Ok(Docs {
            docs: self.docs.ok_or_else(|| BuildError::missing_field("docs"))?,
        })
    }
}
