# frozen_string_literal: true

require_relative "../../requests"

module SeedServerSentEventsClient
  class CompletionsClient
    # @return [SeedServerSentEventsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedServerSentEventsClient::RequestClient]
    # @return [SeedServerSentEventsClient::CompletionsClient]
    def initialize(request_client:)
      @request_client = request_client
    end
  end

  class AsyncCompletionsClient
    # @return [SeedServerSentEventsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedServerSentEventsClient::AsyncRequestClient]
    # @return [SeedServerSentEventsClient::AsyncCompletionsClient]
    def initialize(request_client:)
      @request_client = request_client
    end
  end
end
