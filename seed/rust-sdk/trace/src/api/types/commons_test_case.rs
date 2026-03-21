pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCase {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub params: Vec<VariableValue>,
}

impl TestCase {
    pub fn builder() -> TestCaseBuilder {
        TestCaseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseBuilder {
    id: Option<String>,
    params: Option<Vec<VariableValue>>,
}

impl TestCaseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn params(mut self, value: Vec<VariableValue>) -> Self {
        self.params = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TestCaseBuilder::id)
    /// - [`params`](TestCaseBuilder::params)
    pub fn build(self) -> Result<TestCase, BuildError> {
        Ok(TestCase {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            params: self.params.ok_or_else(|| BuildError::missing_field("params"))?,
        })
    }
}
