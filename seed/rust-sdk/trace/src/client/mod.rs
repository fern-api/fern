pub mod v_2;
pub mod admin;
pub mod homepage;
pub mod migration;
pub mod playlist;
pub mod problem;
pub mod submission;
pub mod sysprop;

pub struct TraceClient {
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
    pub fn new() -> Self {
        Self {
    v_2: V2Client::new("".to_string()),
    admin: AdminClient::new("".to_string()),
    homepage: HomepageClient::new("".to_string()),
    migration: MigrationClient::new("".to_string()),
    playlist: PlaylistClient::new("".to_string()),
    problem: ProblemClient::new("".to_string()),
    submission: SubmissionClient::new("".to_string()),
    sysprop: SyspropClient::new("".to_string())
}
    }

}


pub use v_2::V2Client;
pub use admin::AdminClient;
pub use homepage::HomepageClient;
pub use migration::MigrationClient;
pub use playlist::PlaylistClient;
pub use problem::ProblemClient;
pub use submission::SubmissionClient;
pub use sysprop::SyspropClient;