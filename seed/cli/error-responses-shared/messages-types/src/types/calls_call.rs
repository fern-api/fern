pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Call {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sid: Option<String>,
}

impl Call {
    pub fn builder() -> CallBuilder {
        <CallBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CallBuilder {
    sid: Option<String>,
}

impl CallBuilder {
    pub fn sid(mut self, value: impl Into<String>) -> Self {
        self.sid = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Call`].
    pub fn build(self) -> Result<Call, BuildError> {
        Ok(Call {
            sid: self.sid,
        })
    }
}
