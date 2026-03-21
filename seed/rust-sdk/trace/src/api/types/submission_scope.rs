pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Scope {
    #[serde(default)]
    pub variables: HashMap<String, DebugVariableValue>,
}

impl Scope {
    pub fn builder() -> ScopeBuilder {
        ScopeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ScopeBuilder {
    variables: Option<HashMap<String, DebugVariableValue>>,
}

impl ScopeBuilder {
    pub fn variables(mut self, value: HashMap<String, DebugVariableValue>) -> Self {
        self.variables = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Scope`].
    /// This method will fail if any of the following fields are not set:
    /// - [`variables`](ScopeBuilder::variables)
    pub fn build(self) -> Result<Scope, BuildError> {
        Ok(Scope {
            variables: self.variables.ok_or_else(|| BuildError::missing_field("variables"))?,
        })
    }
}
