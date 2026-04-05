pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FlushedEvent {
}

impl FlushedEvent {
    pub fn builder() -> FlushedEventBuilder {
        <FlushedEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FlushedEventBuilder {
}

impl FlushedEventBuilder {

    /// Consumes the builder and constructs a [`FlushedEvent`].
    pub fn build(self) -> Result<FlushedEvent, BuildError> {
        Ok(FlushedEvent {
        })
    }
}
