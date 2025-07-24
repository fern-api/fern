use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SpecialEnum {
    #[serde(rename = "")]
    A,
    #[serde(rename = "Hello \"World\"")]
    B,
    #[serde(rename = "Hello 'World'")]
    C,
    #[serde(rename = "Hello\\World")]
    D,
    #[serde(rename = "Hello\nWorld")]
    E,
    #[serde(rename = "Hello\rWorld")]
    F,
    #[serde(rename = "Hello\tWorld")]
    H,
    #[serde(rename = "Hello\fWorld")]
    I,
    #[serde(rename = "Hello\u0008World")]
    J,
    #[serde(rename = "Hello\vWorld")]
    K,
    #[serde(rename = "Hello\0World")]
    L,
    #[serde(rename = "Hello\u0007World")]
    M,
    #[serde(rename = "Hello\u0001World")]
    N,
    #[serde(rename = "Hello\u0002World")]
    O,
    #[serde(rename = "Hello\u001FWorld")]
    P,
    #[serde(rename = "Hello\u007FWorld")]
    Q,
    #[serde(rename = "Hello\u009FWorld")]
    R,
    #[serde(rename = "Line 1\n"Quote"\tTab\\Backslash\r\nLine 2\0Null")]
    S,
    #[serde(rename = "\n\r\t\0\u0008\f\v\u0007")]
    T,
    #[serde(rename = "Hello 世界")]
    U,
    #[serde(rename = "café")]
    V,
    #[serde(rename = "🚀")]
    W,
    #[serde(rename = "\\n")]
    X,
    #[serde(rename = "\\")]
    Y,
    #[serde(rename = "{"name": "John", "age": 30, "city": "New York"}")]
    Z,
    #[serde(rename = "SELECT * FROM users WHERE name = 'John O\\'Reilly'")]
    Aa,
    #[serde(rename = "C:\\Users\\John\\Documents\\file.txt")]
    Bb,
    #[serde(rename = "/usr/local/bin/app")]
    Cc,
    #[serde(rename = "\\d{3}-\\d{2}-\\d{4}")]
    Dd,
    #[serde(rename = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")]
    Ee,
    #[serde(rename = "transcript[transcriptType="final"]")]
    Ff,
    #[serde(rename = "transcript[transcriptType='final']")]
    Gg,
}