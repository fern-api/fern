pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseV2 {
    #[serde(default)]
    pub metadata: V2TestCaseMetadata,
    pub implementation: V2TestCaseImplementationReference,
    #[serde(default)]
    pub arguments: HashMap<String, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<V2TestCaseExpects>,
}

impl V2TestCaseV2 {
    pub fn builder() -> V2TestCaseV2Builder {
        <V2TestCaseV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseV2Builder {
    metadata: Option<V2TestCaseMetadata>,
    implementation: Option<V2TestCaseImplementationReference>,
    arguments: Option<HashMap<String, VariableValue>>,
    expects: Option<V2TestCaseExpects>,
}

impl V2TestCaseV2Builder {
    pub fn metadata(mut self, value: V2TestCaseMetadata) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn implementation(mut self, value: V2TestCaseImplementationReference) -> Self {
        self.implementation = Some(value);
        self
    }

    pub fn arguments(mut self, value: HashMap<String, VariableValue>) -> Self {
        self.arguments = Some(value);
        self
    }

    pub fn expects(mut self, value: V2TestCaseExpects) -> Self {
        self.expects = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`metadata`](V2TestCaseV2Builder::metadata)
    /// - [`implementation`](V2TestCaseV2Builder::implementation)
    /// - [`arguments`](V2TestCaseV2Builder::arguments)
    pub fn build(self) -> Result<V2TestCaseV2, BuildError> {
        Ok(V2TestCaseV2 {
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
