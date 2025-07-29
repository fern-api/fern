pub mod endpoints;
pub mod inlined_requests;
pub mod no_auth;
pub mod no_req_body;
pub mod req_with_headers;

pub struct ExhaustiveClient {
    pub endpoints: EndpointsClient,
    pub inlined_requests: InlinedRequestsClient,
    pub no_auth: NoAuthClient,
    pub no_req_body: NoReqBodyClient,
    pub req_with_headers: ReqWithHeadersClient,
}

impl ExhaustiveClient {
    pub fn new() -> Self {
        Self {
    endpoints: EndpointsClient::new("".to_string()),
    inlined_requests: InlinedRequestsClient::new("".to_string()),
    no_auth: NoAuthClient::new("".to_string()),
    no_req_body: NoReqBodyClient::new("".to_string()),
    req_with_headers: ReqWithHeadersClient::new("".to_string())
}
    }

}


pub use endpoints::EndpointsClient;
pub use inlined_requests::InlinedRequestsClient;
pub use no_auth::NoAuthClient;
pub use no_req_body::NoReqBodyClient;
pub use req_with_headers::ReqWithHeadersClient;