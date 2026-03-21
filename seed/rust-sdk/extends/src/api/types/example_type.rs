pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExampleType {
    #[serde(flatten)]
    pub docs_fields: Docs,
    #[serde(default)]
    pub name: String,
}

impl ExampleType {
    pub fn builder() -> ExampleTypeBuilder {
        ExampleTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExampleTypeBuilder {
    docs_fields: Option<Docs>,
    name: Option<String>,
}

impl ExampleTypeBuilder {
    pub fn docs_fields(mut self, value: Docs) -> Self {
        self.docs_fields = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExampleType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`docs_fields`](ExampleTypeBuilder::docs_fields)
    /// - [`name`](ExampleTypeBuilder::name)
    pub fn build(self) -> Result<ExampleType, BuildError> {
        Ok(ExampleType {
            docs_fields: self
                .docs_fields
                .ok_or_else(|| BuildError::missing_field("docs_fields"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
