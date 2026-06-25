use crate::api::*;
use crate::{ApiError, ByteStream, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn convert_audio(
        &self,
        request: &ConvertAudioRequest,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_multipart_stream_request(
                Method::POST,
                "/audio/convert",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .bool("enable_logging", request.enable_logging.clone())
                    .int(
                        "optimize_streaming_latency",
                        request.optimize_streaming_latency.clone(),
                    )
                    .string("output_format", request.output_format.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn isolate_audio(
        &self,
        request: &IsolateAudioRequest,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_multipart_stream_request(
                Method::POST,
                "/audio/isolate",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    pub async fn transcribe_audio(
        &self,
        request: &TranscribeAudioRequest,
        options: Option<RequestOptions>,
    ) -> Result<TranscriptionResult, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/audio/transcribe",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .string("language", request.language.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn speech_to_speech(
        &self,
        request: &SpeechToSpeechRequest2,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_multipart_stream_request(
                Method::POST,
                "/speech-to-speech/convert",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .bool("enable_logging", request.enable_logging.clone())
                    .int(
                        "optimize_streaming_latency",
                        request.optimize_streaming_latency.clone(),
                    )
                    .string("output_format", request.output_format.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "/snippet", None, None, options)
            .await
    }
}
