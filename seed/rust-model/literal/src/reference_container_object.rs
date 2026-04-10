pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ContainerObject {
    #[serde(rename = "nestedObjects")]
    #[serde(default)]
    pub nested_objects: Vec<NestedObjectWithLiterals>,
}

impl ContainerObject {
    pub fn builder() -> ContainerObjectBuilder {
        <ContainerObjectBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ContainerObjectBuilder {
    nested_objects: Option<Vec<NestedObjectWithLiterals>>,
}

impl ContainerObjectBuilder {
    pub fn nested_objects(mut self, value: Vec<NestedObjectWithLiterals>) -> Self {
        self.nested_objects = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ContainerObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nested_objects`](ContainerObjectBuilder::nested_objects)
    pub fn build(self) -> Result<ContainerObject, BuildError> {
        Ok(ContainerObject {
            nested_objects: self.nested_objects.ok_or_else(|| BuildError::missing_field("nested_objects"))?,
        })
    }
}
