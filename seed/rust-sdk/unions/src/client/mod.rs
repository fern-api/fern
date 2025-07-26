pub mod bigunion;
pub mod union_;

pub struct UnionsClient {
    pub bigunion: BigunionClient,
    pub union_: UnionClient,
}

impl UnionsClient {
    pub fn new() -> Self {
        Self {
    bigunion: BigunionClient::new("".to_string()),
    union_: UnionClient::new("".to_string())
}
    }

}


pub use bigunion::BigunionClient;
pub use union_::UnionClient;