pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata {
    #[serde(default)]
    pub id: TestCaseId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}

impl TestCaseMetadata {
    pub fn builder() -> TestCaseMetadataBuilder {
        TestCaseMetadataBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseMetadataBuilder {
    id: Option<TestCaseId>,
    name: Option<String>,
    hidden: Option<bool>,
}

impl TestCaseMetadataBuilder {
    pub fn id(mut self, value: TestCaseId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn hidden(mut self, value: bool) -> Self {
        self.hidden = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TestCaseMetadataBuilder::id)
    /// - [`name`](TestCaseMetadataBuilder::name)
    /// - [`hidden`](TestCaseMetadataBuilder::hidden)
    pub fn build(self) -> Result<TestCaseMetadata, BuildError> {
        Ok(TestCaseMetadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            hidden: self.hidden.ok_or_else(|| BuildError::missing_field("hidden"))?,
        })
    }
}
