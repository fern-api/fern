pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Conversation {
    #[serde(default)]
    pub foo: String,
}

impl Conversation {
    pub fn builder() -> ConversationBuilder {
        ConversationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ConversationBuilder {
    foo: Option<String>,
}

impl ConversationBuilder {
    pub fn foo(mut self, value: impl Into<String>) -> Self {
        self.foo = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Conversation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](ConversationBuilder::foo)
    pub fn build(self) -> Result<Conversation, BuildError> {
        Ok(Conversation {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
        })
    }
}
