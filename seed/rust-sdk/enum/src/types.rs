use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operand {
    GreaterThan,
    EqualTo,
    LessThan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Color {
    Red,
    Blue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EnumWithCustom {
    Safe,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SpecialEnum {
    A,
    B,
    C,
    D,
    E,
    F,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
    Aa,
    Bb,
    Cc,
    Dd,
    Ee,
    Ff,
    Gg,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Status {
    Known,
    Unknown,
}

