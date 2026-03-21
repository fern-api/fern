pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV2 {
    #[serde(default)]
    pub metadata: TestCaseMetadata,
    pub implementation: TestCaseImplementationReference,
    #[serde(default)]
    pub arguments: HashMap<ParameterId, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects>,
}

impl TestCaseV2 {
    pub fn builder() -> TestCaseV2Builder {
        TestCaseV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseV2Builder {
    metadata: Option<TestCaseMetadata>,
    implementation: Option<TestCaseImplementationReference>,
    arguments: Option<HashMap<ParameterId, VariableValue>>,
    expects: Option<TestCaseExpects>,
}

impl TestCaseV2Builder {
    pub fn metadata(mut self, value: TestCaseMetadata) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn implementation(mut self, value: TestCaseImplementationReference) -> Self {
        self.implementation = Some(value);
        self
    }

    pub fn arguments(mut self, value: HashMap<ParameterId, VariableValue>) -> Self {
        self.arguments = Some(value);
        self
    }

    pub fn expects(mut self, value: TestCaseExpects) -> Self {
        self.expects = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`metadata`](TestCaseV2Builder::metadata)
    /// - [`implementation`](TestCaseV2Builder::implementation)
    /// - [`arguments`](TestCaseV2Builder::arguments)
    pub fn build(self) -> Result<TestCaseV2, BuildError> {
        Ok(TestCaseV2 {
            metadata: self.metadata.ok_or_else(|| BuildError::missing_field("metadata"))?,
            implementation: self.implementation.ok_or_else(|| BuildError::missing_field("implementation"))?,
            arguments: self.arguments.ok_or_else(|| BuildError::missing_field("arguments"))?,
            expects: self.expects,
        })
    }
}
