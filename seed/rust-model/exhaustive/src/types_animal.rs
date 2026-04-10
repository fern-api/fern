pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum TypesAnimal {
        TypesAnimalZero(TypesAnimalZero),

        TypesAnimalOne(TypesAnimalOne),
}

impl TypesAnimal {
    pub fn is_types_animal_zero(&self) -> bool {
        matches!(self, Self::TypesAnimalZero(_))
    }

    pub fn is_types_animal_one(&self) -> bool {
        matches!(self, Self::TypesAnimalOne(_))
    }


    pub fn as_types_animal_zero(&self) -> Option<&TypesAnimalZero> {
        match self {
                    Self::TypesAnimalZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_types_animal_zero(self) -> Option<TypesAnimalZero> {
        match self {
                    Self::TypesAnimalZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_types_animal_one(&self) -> Option<&TypesAnimalOne> {
        match self {
                    Self::TypesAnimalOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_types_animal_one(self) -> Option<TypesAnimalOne> {
        match self {
                    Self::TypesAnimalOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for TypesAnimal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TypesAnimalZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::TypesAnimalOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
