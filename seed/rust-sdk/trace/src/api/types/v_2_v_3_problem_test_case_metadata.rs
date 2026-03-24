pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata2 {
    #[serde(default)]
    pub id: TestCaseId2,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}

impl TestCaseMetadata2 {
    pub fn builder() -> TestCaseMetadata2Builder {
        TestCaseMetadata2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseMetadata2Builder {
    id: Option<TestCaseId2>,
    name: Option<String>,
    hidden: Option<bool>,
}

impl TestCaseMetadata2Builder {
    pub fn id(mut self, value: TestCaseId2) -> Self {
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

    /// Consumes the builder and constructs a [`TestCaseMetadata2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TestCaseMetadata2Builder::id)
    /// - [`name`](TestCaseMetadata2Builder::name)
    /// - [`hidden`](TestCaseMetadata2Builder::hidden)
    pub fn build(self) -> Result<TestCaseMetadata2, BuildError> {
        Ok(TestCaseMetadata2 {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            hidden: self
                .hidden
                .ok_or_else(|| BuildError::missing_field("hidden"))?,
        })
    }
}
