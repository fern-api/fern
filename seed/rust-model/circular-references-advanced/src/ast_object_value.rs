pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectValue {
}

impl ObjectValue {
    pub fn builder() -> ObjectValueBuilder {
        ObjectValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectValueBuilder {
}

impl ObjectValueBuilder {

    /// Consumes the builder and constructs a [`ObjectValue`].
    pub fn build(self) -> Result<ObjectValue, BuildError> {
        Ok(ObjectValue {
        })
    }
}
