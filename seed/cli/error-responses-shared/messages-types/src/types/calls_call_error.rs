pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CallError {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl CallError {
    pub fn builder() -> CallErrorBuilder {
        <CallErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CallErrorBuilder {
    code: Option<i64>,
    message: Option<String>,
}

impl CallErrorBuilder {
    pub fn code(mut self, value: i64) -> Self {
        self.code = Some(value);
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CallError`].
    pub fn build(self) -> Result<CallError, BuildError> {
        Ok(CallError {
            code: self.code,
            message: self.message,
        })
    }
}
