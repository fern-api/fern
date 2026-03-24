pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation2 {
    #[serde(default)]
    pub description: TestCaseImplementationDescription2,
    pub function: TestCaseFunction2,
}

impl TestCaseImplementation2 {
    pub fn builder() -> TestCaseImplementation2Builder {
        TestCaseImplementation2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseImplementation2Builder {
    description: Option<TestCaseImplementationDescription2>,
    function: Option<TestCaseFunction2>,
}

impl TestCaseImplementation2Builder {
    pub fn description(mut self, value: TestCaseImplementationDescription2) -> Self {
        self.description = Some(value);
        self
    }

    pub fn function(mut self, value: TestCaseFunction2) -> Self {
        self.function = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseImplementation2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`description`](TestCaseImplementation2Builder::description)
    /// - [`function`](TestCaseImplementation2Builder::function)
    pub fn build(self) -> Result<TestCaseImplementation2, BuildError> {
        Ok(TestCaseImplementation2 {
            description: self
                .description
                .ok_or_else(|| BuildError::missing_field("description"))?,
            function: self
                .function
                .ok_or_else(|| BuildError::missing_field("function"))?,
        })
    }
}
