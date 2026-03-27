pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ProtocolHeartbeat {}

impl ProtocolHeartbeat {
    pub fn builder() -> ProtocolHeartbeatBuilder {
        ProtocolHeartbeatBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProtocolHeartbeatBuilder {}

impl ProtocolHeartbeatBuilder {
    /// Consumes the builder and constructs a [`ProtocolHeartbeat`].
    pub fn build(self) -> Result<ProtocolHeartbeat, BuildError> {
        Ok(ProtocolHeartbeat {})
    }
}
