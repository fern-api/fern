//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **V2**
//! - **Admin**
//! - **Commons**
//! - **Homepage**
//! - **LangServer**
//! - **Migration**
//! - **Playlist**
//! - **Problem**
//! - **Submission**
//! - **Sysprop**

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

pub use admin::AdminClient;
pub use commons::CommonsClient;
pub use homepage::HomepageClient;
pub use lang_server::LangServerClient;
pub use migration::MigrationClient;
pub use playlist::PlaylistClient;
pub use problem::ProblemClient;
pub use submission::SubmissionClient;
pub use sysprop::SyspropClient;
pub use v_2::V2Client;
