pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AstllmNodeWithSchema {
    pub r#type: AstllmNodeWithSchemaType,
    #[serde(default)]
    pub model: String,
    #[serde(default)]
    pub value_schema: HashMap<String, serde_json::Value>,
}

impl AstllmNodeWithSchema {
    pub fn builder() -> AstllmNodeWithSchemaBuilder {
        <AstllmNodeWithSchemaBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AstllmNodeWithSchemaBuilder {
    r#type: Option<AstllmNodeWithSchemaType>,
    model: Option<String>,
    value_schema: Option<HashMap<String, serde_json::Value>>,
}

impl AstllmNodeWithSchemaBuilder {
    pub fn r#type(mut self, value: AstllmNodeWithSchemaType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn model(mut self, value: impl Into<String>) -> Self {
        self.model = Some(value.into());
        self
    }

    pub fn value_schema(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.value_schema = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`AstllmNodeWithSchema`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](AstllmNodeWithSchemaBuilder::r#type)
    /// - [`model`](AstllmNodeWithSchemaBuilder::model)
    /// - [`value_schema`](AstllmNodeWithSchemaBuilder::value_schema)
    pub fn build(self) -> Result<AstllmNodeWithSchema, BuildError> {
        Ok(AstllmNodeWithSchema {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            model: self.model.ok_or_else(|| BuildError::missing_field("model"))?,
            value_schema: self.value_schema.ok_or_else(|| BuildError::missing_field("value_schema"))?,
        })
    }
}
