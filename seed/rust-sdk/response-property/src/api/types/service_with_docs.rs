pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithDocs {
    #[serde(default)]
    pub docs: String,
}

impl WithDocs {
    pub fn builder() -> WithDocsBuilder {
        <WithDocsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithDocsBuilder {
    docs: Option<String>,
}

impl WithDocsBuilder {
    pub fn docs(mut self, value: impl Into<String>) -> Self {
        self.docs = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WithDocs`].
    /// This method will fail if any of the following fields are not set:
    /// - [`docs`](WithDocsBuilder::docs)
    pub fn build(self) -> Result<WithDocs, BuildError> {
        Ok(WithDocs {
            docs: self.docs.ok_or_else(|| BuildError::missing_field("docs"))?,
        })
    }
}
