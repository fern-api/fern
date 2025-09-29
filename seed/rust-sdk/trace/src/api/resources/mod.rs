use crate::{ApiError, ClientConfig};

pub mod admin;
pub mod commons;
pub mod homepage;
pub mod lang_server;
pub mod migration;
pub mod playlist;
pub mod problem;
pub mod submission;
pub mod sysprop;
pub mod v_2;
pub struct TraceClient {
    pub config: ClientConfig,
    pub v_2: V2Client,
    pub admin: AdminClient,
    pub homepage: HomepageClient,
    pub migration: MigrationClient,
    pub playlist: PlaylistClient,
    pub problem: ProblemClient,
    pub submission: SubmissionClient,
    pub sysprop: SyspropClient,
}

impl TraceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            v_2: V2Client::new(config.clone())?,
            admin: AdminClient::new(config.clone())?,
            homepage: HomepageClient::new(config.clone())?,
            migration: MigrationClient::new(config.clone())?,
            playlist: PlaylistClient::new(config.clone())?,
            problem: ProblemClient::new(config.clone())?,
            submission: SubmissionClient::new(config.clone())?,
            sysprop: SyspropClient::new(config.clone())?,
        })
    }
}

pub use admin::*;
pub use commons::*;
pub use homepage::*;
pub use lang_server::*;
pub use migration::*;
pub use playlist::*;
pub use problem::*;
pub use submission::*;
pub use sysprop::*;
pub use v_2::*;
