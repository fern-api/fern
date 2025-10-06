pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AstAnimal {
        Cat(AstCat),

        Dog(AstDog),
}

impl AstAnimal {
    pub fn is_cat(&self) -> bool {
        matches!(self, Self::Cat(_))
    }

    pub fn is_dog(&self) -> bool {
        matches!(self, Self::Dog(_))
    }


    pub fn as_cat(&self) -> Option<&AstCat> {
        match self {
                    Self::Cat(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_cat(self) -> Option<AstCat> {
        match self {
                    Self::Cat(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_dog(&self) -> Option<&AstDog> {
        match self {
                    Self::Dog(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_dog(self) -> Option<AstDog> {
        match self {
                    Self::Dog(value) => Some(value),
                    _ => None,
                }
    }

}
