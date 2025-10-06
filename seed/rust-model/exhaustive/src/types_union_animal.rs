pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "animal")]
pub enum TypesUnionAnimal {
        Dog {
            #[serde(flatten)]
            data: TypesUnionDog,
        },

        Cat {
            #[serde(flatten)]
            data: TypesUnionCat,
        },
}
