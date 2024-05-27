# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_server_sent_events/completions/client"

module SeedServerSentEventsClient
  class Client
    # @return [SeedServerSentEventsClient::CompletionsClient]
    attr_reader :completions

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedServerSentEventsClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedServerSentEventsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @completions = SeedServerSentEventsClient::CompletionsClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedServerSentEventsClient::AsyncCompletionsClient]
    attr_reader :completions

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedServerSentEventsClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedServerSentEventsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @completions = SeedServerSentEventsClient::AsyncCompletionsClient.new(request_client: @async_request_client)
    end
  end
end
