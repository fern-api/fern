pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SearchResultTwo {
    #[serde(flatten)]
    pub document_fields: Document,
    pub r#type: SearchResultTwoType,
}

impl SearchResultTwo {
    pub fn builder() -> SearchResultTwoBuilder {
        <SearchResultTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchResultTwoBuilder {
    document_fields: Option<Document>,
    r#type: Option<SearchResultTwoType>,
}

impl SearchResultTwoBuilder {
    pub fn document_fields(mut self, value: Document) -> Self {
        self.document_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SearchResultTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchResultTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`document_fields`](SearchResultTwoBuilder::document_fields)
    /// - [`r#type`](SearchResultTwoBuilder::r#type)
    pub fn build(self) -> Result<SearchResultTwo, BuildError> {
        Ok(SearchResultTwo {
            document_fields: self
                .document_fields
                .ok_or_else(|| BuildError::missing_field("document_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
