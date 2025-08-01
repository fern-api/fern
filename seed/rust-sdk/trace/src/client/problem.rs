use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ProblemClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl ProblemClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn get_lightweight_problems(&self, options: Option<RequestOptions>) -> Result<Vec<LightweightProblemInfoV2>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/problems-v2/lightweight-problem-info",
            None,
            None,
            options,
        ).await
    }

    pub async fn get_problems(&self, options: Option<RequestOptions>) -> Result<Vec<ProblemInfoV2>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/problems-v2/problem-info",
            None,
            None,
            options,
        ).await
    }

    pub async fn get_latest_problem(&self, problem_id: &ProblemId, options: Option<RequestOptions>) -> Result<ProblemInfoV2, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/problems-v2/problem-info/{}", problem_id.0),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_problem_version(&self, problem_id: &ProblemId, problem_version: i32, options: Option<RequestOptions>) -> Result<ProblemInfoV2, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/problems-v2/problem-info/{}{}", problem_id.0, problem_version),
            None,
            None,
            options,
        ).await
    }

}

ST,
            "/problem-crud/default-starter-files",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

