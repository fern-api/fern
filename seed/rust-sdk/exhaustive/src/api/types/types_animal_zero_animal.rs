pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TypesAnimalZeroAnimal {
    #[serde(rename = "dog")]
    Dog,
}
impl fmt::Display for TypesAnimalZeroAnimal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Dog => "dog",
        };
        write!(f, "{}", s)
    }
}
