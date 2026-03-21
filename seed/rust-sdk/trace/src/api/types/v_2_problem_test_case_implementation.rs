pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation {
    #[serde(default)]
    pub description: TestCaseImplementationDescription,
    pub function: TestCaseFunction,
}

impl TestCaseImplementation {
    pub fn builder() -> TestCaseImplementationBuilder {
        TestCaseImplementationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseImplementationBuilder {
    description: Option<TestCaseImplementationDescription>,
    function: Option<TestCaseFunction>,
}

impl TestCaseImplementationBuilder {
    pub fn description(mut self, value: TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn function(mut self, value: TestCaseFunction) -> Self {
        self.function = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`description`](TestCaseImplementationBuilder::description)
    /// - [`function`](TestCaseImplementationBuilder::function)
    pub fn build(self) -> Result<TestCaseImplementation, BuildError> {
        Ok(TestCaseImplementation {
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            function: self.function.ok_or_else(|| BuildError::missing_field("function"))?,
        })
    }
}
