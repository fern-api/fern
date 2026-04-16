pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RuleCreateRequest {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "executionContext")]
    pub execution_context: RuleExecutionContext,
}

impl RuleCreateRequest {
    pub fn builder() -> RuleCreateRequestBuilder {
        <RuleCreateRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuleCreateRequestBuilder {
    name: Option<String>,
    execution_context: Option<RuleExecutionContext>,
}

impl RuleCreateRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn execution_context(mut self, value: RuleExecutionContext) -> Self {
        self.execution_context = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RuleCreateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](RuleCreateRequestBuilder::name)
    /// - [`execution_context`](RuleCreateRequestBuilder::execution_context)
    pub fn build(self) -> Result<RuleCreateRequest, BuildError> {
        Ok(RuleCreateRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            execution_context: self.execution_context.ok_or_else(|| BuildError::missing_field("execution_context"))?,
        })
    }
}

