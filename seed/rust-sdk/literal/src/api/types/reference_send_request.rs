pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendRequest {
    pub prompt: String,
    #[serde(default)]
    pub query: String,
    pub stream: bool,
    pub ending: String,
    pub context: SomeLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<SomeLiteral>,
    #[serde(rename = "containerObject")]
    #[serde(default)]
    pub container_object: ContainerObject,
}

impl SendRequest {
    pub fn builder() -> SendRequestBuilder {
        SendRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendRequestBuilder {
    prompt: Option<String>,
    query: Option<String>,
    stream: Option<bool>,
    ending: Option<String>,
    context: Option<SomeLiteral>,
    maybe_context: Option<SomeLiteral>,
    container_object: Option<ContainerObject>,
}

impl SendRequestBuilder {
    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
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

    pub fn ending(mut self, value: impl Into<String>) -> Self {
        self.ending = Some(value.into());
        self
    }

    pub fn context(mut self, value: SomeLiteral) -> Self {
        self.context = Some(value);
        self
    }

    pub fn maybe_context(mut self, value: SomeLiteral) -> Self {
        self.maybe_context = Some(value);
        self
    }

    pub fn container_object(mut self, value: ContainerObject) -> Self {
        self.container_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](SendRequestBuilder::prompt)
    /// - [`query`](SendRequestBuilder::query)
    /// - [`stream`](SendRequestBuilder::stream)
    /// - [`ending`](SendRequestBuilder::ending)
    /// - [`context`](SendRequestBuilder::context)
    /// - [`container_object`](SendRequestBuilder::container_object)
    pub fn build(self) -> Result<SendRequest, BuildError> {
        Ok(SendRequest {
            prompt: self
                .prompt
                .ok_or_else(|| BuildError::missing_field("prompt"))?,
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            ending: self
                .ending
                .ok_or_else(|| BuildError::missing_field("ending"))?,
            context: self
                .context
                .ok_or_else(|| BuildError::missing_field("context"))?,
            maybe_context: self.maybe_context,
            container_object: self
                .container_object
                .ok_or_else(|| BuildError::missing_field("container_object"))?,
        })
    }
}
