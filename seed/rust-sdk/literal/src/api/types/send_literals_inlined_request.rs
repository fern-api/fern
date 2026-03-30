pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SendLiteralsInlinedRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
    #[serde(default)]
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    pub stream: bool,
    #[serde(rename = "aliasedContext")]
    pub aliased_context: SomeAliasedLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<SomeAliasedLiteral>,
    #[serde(rename = "objectWithLiteral")]
    pub object_with_literal: ATopLevelLiteral,
}

impl SendLiteralsInlinedRequest {
    pub fn builder() -> SendLiteralsInlinedRequestBuilder {
        <SendLiteralsInlinedRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendLiteralsInlinedRequestBuilder {
    prompt: Option<String>,
    context: Option<String>,
    query: Option<String>,
    temperature: Option<f64>,
    stream: Option<bool>,
    aliased_context: Option<SomeAliasedLiteral>,
    maybe_context: Option<SomeAliasedLiteral>,
    object_with_literal: Option<ATopLevelLiteral>,
}

impl SendLiteralsInlinedRequestBuilder {
    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
        self
    }

    pub fn context(mut self, value: impl Into<String>) -> Self {
        self.context = Some(value.into());
        self
    }

    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn temperature(mut self, value: f64) -> Self {
        self.temperature = Some(value);
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn aliased_context(mut self, value: SomeAliasedLiteral) -> Self {
        self.aliased_context = Some(value);
        self
    }

    pub fn maybe_context(mut self, value: SomeAliasedLiteral) -> Self {
        self.maybe_context = Some(value);
        self
    }

    pub fn object_with_literal(mut self, value: ATopLevelLiteral) -> Self {
        self.object_with_literal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendLiteralsInlinedRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](SendLiteralsInlinedRequestBuilder::prompt)
    /// - [`query`](SendLiteralsInlinedRequestBuilder::query)
    /// - [`stream`](SendLiteralsInlinedRequestBuilder::stream)
    /// - [`aliased_context`](SendLiteralsInlinedRequestBuilder::aliased_context)
    /// - [`object_with_literal`](SendLiteralsInlinedRequestBuilder::object_with_literal)
    pub fn build(self) -> Result<SendLiteralsInlinedRequest, BuildError> {
        Ok(SendLiteralsInlinedRequest {
            prompt: self
                .prompt
                .ok_or_else(|| BuildError::missing_field("prompt"))?,
            context: self.context,
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            temperature: self.temperature,
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            aliased_context: self
                .aliased_context
                .ok_or_else(|| BuildError::missing_field("aliased_context"))?,
            maybe_context: self.maybe_context,
            object_with_literal: self
                .object_with_literal
                .ok_or_else(|| BuildError::missing_field("object_with_literal"))?,
        })
    }
}
