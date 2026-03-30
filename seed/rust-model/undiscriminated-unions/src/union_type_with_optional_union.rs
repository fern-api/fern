pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypeWithOptionalUnion {
    #[serde(rename = "myUnion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub my_union: Option<MyUnion>,
}

impl TypeWithOptionalUnion {
    pub fn builder() -> TypeWithOptionalUnionBuilder {
        <TypeWithOptionalUnionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeWithOptionalUnionBuilder {
    my_union: Option<MyUnion>,
}

impl TypeWithOptionalUnionBuilder {
    pub fn my_union(mut self, value: MyUnion) -> Self {
        self.my_union = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypeWithOptionalUnion`].
    pub fn build(self) -> Result<TypeWithOptionalUnion, BuildError> {
        Ok(TypeWithOptionalUnion {
            my_union: self.my_union,
        })
    }
}
