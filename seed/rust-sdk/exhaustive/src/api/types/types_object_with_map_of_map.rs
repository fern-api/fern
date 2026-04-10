pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesObjectWithMapOfMap {
    #[serde(default)]
    pub map: HashMap<String, HashMap<String, String>>,
}

impl TypesObjectWithMapOfMap {
    pub fn builder() -> TypesObjectWithMapOfMapBuilder {
        <TypesObjectWithMapOfMapBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithMapOfMapBuilder {
    map: Option<HashMap<String, HashMap<String, String>>>,
}

impl TypesObjectWithMapOfMapBuilder {
    pub fn map(mut self, value: HashMap<String, HashMap<String, String>>) -> Self {
        self.map = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithMapOfMap`].
    /// This method will fail if any of the following fields are not set:
    /// - [`map`](TypesObjectWithMapOfMapBuilder::map)
    pub fn build(self) -> Result<TypesObjectWithMapOfMap, BuildError> {
        Ok(TypesObjectWithMapOfMap {
            map: self.map.ok_or_else(|| BuildError::missing_field("map"))?,
        })
    }
}
