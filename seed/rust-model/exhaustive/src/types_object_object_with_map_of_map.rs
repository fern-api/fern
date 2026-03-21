pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithMapOfMap {
    #[serde(default)]
    pub map: HashMap<String, HashMap<String, String>>,
}

impl ObjectWithMapOfMap {
    pub fn builder() -> ObjectWithMapOfMapBuilder {
        ObjectWithMapOfMapBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithMapOfMapBuilder {
    map: Option<HashMap<String, HashMap<String, String>>>,
}

impl ObjectWithMapOfMapBuilder {
    pub fn map(mut self, value: HashMap<String, HashMap<String, String>>) -> Self {
        self.map = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithMapOfMap`].
    /// This method will fail if any of the following fields are not set:
    /// - [`map`](ObjectWithMapOfMapBuilder::map)
    pub fn build(self) -> Result<ObjectWithMapOfMap, BuildError> {
        Ok(ObjectWithMapOfMap {
            map: self.map.ok_or_else(|| BuildError::missing_field("map"))?,
        })
    }
}
