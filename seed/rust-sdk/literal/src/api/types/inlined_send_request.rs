pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InlinedSendRequest {
    pub prompt: InlinedSendRequestPrompt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<InlinedSendRequestContext>,
    #[serde(default)]
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(default)]
    pub stream: bool,
    #[serde(rename = "aliasedContext")]
    pub aliased_context: SomeAliasedLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<SomeAliasedLiteral>,
    #[serde(rename = "objectWithLiteral")]
    pub object_with_literal: ATopLevelLiteral,
}

impl InlinedSendRequest {
    pub fn builder() -> InlinedSendRequestBuilder {
        <InlinedSendRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlinedSendRequestBuilder {
    prompt: Option<InlinedSendRequestPrompt>,
    context: Option<InlinedSendRequestContext>,
    query: Option<String>,
    temperature: Option<f64>,
    stream: Option<bool>,
    aliased_context: Option<SomeAliasedLiteral>,
    maybe_context: Option<SomeAliasedLiteral>,
    object_with_literal: Option<ATopLevelLiteral>,
}

impl InlinedSendRequestBuilder {
    pub fn prompt(mut self, value: InlinedSendRequestPrompt) -> Self {
        self.prompt = Some(value);
        self
    }

    pub fn context(mut self, value: InlinedSendRequestContext) -> Self {
        self.context = Some(value);
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

    /// Consumes the builder and constructs a [`InlinedSendRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](InlinedSendRequestBuilder::prompt)
    /// - [`query`](InlinedSendRequestBuilder::query)
    /// - [`stream`](InlinedSendRequestBuilder::stream)
    /// - [`aliased_context`](InlinedSendRequestBuilder::aliased_context)
    /// - [`object_with_literal`](InlinedSendRequestBuilder::object_with_literal)
    pub fn build(self) -> Result<InlinedSendRequest, BuildError> {
        Ok(InlinedSendRequest {
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
