pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithBaseProperties {
        Integer {
            value: i64,
            id: String,
        },

        String {
            value: String,
            id: String,
        },

        Foo {
            #[serde(flatten)]
            data: TypesFoo,
            id: String,
        },
}

impl TypesUnionWithBaseProperties {
    pub fn get_id(&self) -> &String {
        match self {
                    Self::Integer { id, .. } => id,
                    Self::String { id, .. } => id,
                    Self::Foo { id, .. } => id,
                }
    }

}
