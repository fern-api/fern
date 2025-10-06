pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TypesAnimal {
        Dog {
            #[serde(flatten)]
            data: TypesDog,
        },

        Cat {
            #[serde(flatten)]
            data: TypesCat,
        },

        Bird {
            #[serde(flatten)]
            data: TypesBird,
        },
}
