pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AstllmNodeWithPrompt {
    pub r#type: AstllmNodeWithPromptType,
    #[serde(default)]
    pub model: String,
    #[serde(default)]
    pub prompt: String,
}

impl AstllmNodeWithPrompt {
    pub fn builder() -> AstllmNodeWithPromptBuilder {
        <AstllmNodeWithPromptBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AstllmNodeWithPromptBuilder {
    r#type: Option<AstllmNodeWithPromptType>,
    model: Option<String>,
    prompt: Option<String>,
}

impl AstllmNodeWithPromptBuilder {
    pub fn r#type(mut self, value: AstllmNodeWithPromptType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn model(mut self, value: impl Into<String>) -> Self {
        self.model = Some(value.into());
        self
    }

    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AstllmNodeWithPrompt`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](AstllmNodeWithPromptBuilder::r#type)
    /// - [`model`](AstllmNodeWithPromptBuilder::model)
    /// - [`prompt`](AstllmNodeWithPromptBuilder::prompt)
    pub fn build(self) -> Result<AstllmNodeWithPrompt, BuildError> {
        Ok(AstllmNodeWithPrompt {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            model: self
                .model
                .ok_or_else(|| BuildError::missing_field("model"))?,
            prompt: self
                .prompt
                .ok_or_else(|| BuildError::missing_field("prompt"))?,
        })
    }
}
