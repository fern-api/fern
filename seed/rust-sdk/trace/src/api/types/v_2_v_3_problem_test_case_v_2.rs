pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV22 {
    #[serde(default)]
    pub metadata: TestCaseMetadata2,
    pub implementation: TestCaseImplementationReference2,
    #[serde(default)]
    pub arguments: HashMap<ParameterId2, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects2>,
}

impl TestCaseV22 {
    pub fn builder() -> TestCaseV22Builder {
        TestCaseV22Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseV22Builder {
    metadata: Option<TestCaseMetadata2>,
    implementation: Option<TestCaseImplementationReference2>,
    arguments: Option<HashMap<ParameterId2, VariableValue>>,
    expects: Option<TestCaseExpects2>,
}

impl TestCaseV22Builder {
    pub fn metadata(mut self, value: TestCaseMetadata2) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn implementation(mut self, value: TestCaseImplementationReference2) -> Self {
        self.implementation = Some(value);
        self
    }

    pub fn arguments(mut self, value: HashMap<ParameterId2, VariableValue>) -> Self {
        self.arguments = Some(value);
        self
    }

    pub fn expects(mut self, value: TestCaseExpects2) -> Self {
        self.expects = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseV22`].
    /// This method will fail if any of the following fields are not set:
    /// - [`metadata`](TestCaseV22Builder::metadata)
    /// - [`implementation`](TestCaseV22Builder::implementation)
    /// - [`arguments`](TestCaseV22Builder::arguments)
    pub fn build(self) -> Result<TestCaseV22, BuildError> {
        Ok(TestCaseV22 {
            metadata: self
                .metadata
                .ok_or_else(|| BuildError::missing_field("metadata"))?,
            implementation: self
                .implementation
                .ok_or_else(|| BuildError::missing_field("implementation"))?,
            arguments: self
                .arguments
                .ok_or_else(|| BuildError::missing_field("arguments"))?,
            expects: self.expects,
        })
    }
}
