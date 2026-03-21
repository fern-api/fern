pub use crate::prelude::*;

/// Query parameters for send
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendQueryRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prompt: Option<String>,
    pub alias_prompt: AliasToPrompt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_prompt: Option<AliasToPrompt>,
    #[serde(default)]
    pub query: String,
    pub stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_stream: Option<bool>,
    pub alias_stream: AliasToStream,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_stream: Option<AliasToStream>,
}

impl SendQueryRequest {
    pub fn builder() -> SendQueryRequestBuilder {
        SendQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendQueryRequestBuilder {
    prompt: Option<String>,
    optional_prompt: Option<String>,
    alias_prompt: Option<AliasToPrompt>,
    alias_optional_prompt: Option<AliasToPrompt>,
    query: Option<String>,
    stream: Option<bool>,
    optional_stream: Option<bool>,
    alias_stream: Option<AliasToStream>,
    alias_optional_stream: Option<AliasToStream>,
}

impl SendQueryRequestBuilder {
    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
        self
    }

    pub fn optional_prompt(mut self, value: impl Into<String>) -> Self {
        self.optional_prompt = Some(value.into());
        self
    }

    pub fn alias_prompt(mut self, value: AliasToPrompt) -> Self {
        self.alias_prompt = Some(value);
        self
    }

    pub fn alias_optional_prompt(mut self, value: AliasToPrompt) -> Self {
        self.alias_optional_prompt = Some(value);
        self
    }

    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn optional_stream(mut self, value: bool) -> Self {
        self.optional_stream = Some(value);
        self
    }

    pub fn alias_stream(mut self, value: AliasToStream) -> Self {
        self.alias_stream = Some(value);
        self
    }

    pub fn alias_optional_stream(mut self, value: AliasToStream) -> Self {
        self.alias_optional_stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](SendQueryRequestBuilder::prompt)
    /// - [`alias_prompt`](SendQueryRequestBuilder::alias_prompt)
    /// - [`query`](SendQueryRequestBuilder::query)
    /// - [`stream`](SendQueryRequestBuilder::stream)
    /// - [`alias_stream`](SendQueryRequestBuilder::alias_stream)
    pub fn build(self) -> Result<SendQueryRequest, BuildError> {
        Ok(SendQueryRequest {
            prompt: self.prompt.ok_or_else(|| BuildError::missing_field("prompt"))?,
            optional_prompt: self.optional_prompt,
            alias_prompt: self.alias_prompt.ok_or_else(|| BuildError::missing_field("alias_prompt"))?,
            alias_optional_prompt: self.alias_optional_prompt,
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
            optional_stream: self.optional_stream,
            alias_stream: self.alias_stream.ok_or_else(|| BuildError::missing_field("alias_stream"))?,
            alias_optional_stream: self.alias_optional_stream,
        })
    }
}

