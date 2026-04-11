pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct StackFrame {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    #[serde(rename = "lineNumber")]
    #[serde(default)]
    pub line_number: i64,
    #[serde(default)]
    pub scopes: Vec<Scope>,
}

impl StackFrame {
    pub fn builder() -> StackFrameBuilder {
        <StackFrameBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StackFrameBuilder {
    method_name: Option<String>,
    line_number: Option<i64>,
    scopes: Option<Vec<Scope>>,
}

impl StackFrameBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn line_number(mut self, value: i64) -> Self {
        self.line_number = Some(value);
        self
    }

    pub fn scopes(mut self, value: Vec<Scope>) -> Self {
        self.scopes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StackFrame`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](StackFrameBuilder::method_name)
    /// - [`line_number`](StackFrameBuilder::line_number)
    /// - [`scopes`](StackFrameBuilder::scopes)
    pub fn build(self) -> Result<StackFrame, BuildError> {
        Ok(StackFrame {
            method_name: self
                .method_name
                .ok_or_else(|| BuildError::missing_field("method_name"))?,
            line_number: self
                .line_number
                .ok_or_else(|| BuildError::missing_field("line_number"))?,
            scopes: self
                .scopes
                .ok_or_else(|| BuildError::missing_field("scopes"))?,
        })
    }
}
