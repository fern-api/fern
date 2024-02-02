# frozen_string_literal: true

require_relative "seed_literal_client/literal/types/create_options_response"
require_relative "seed_literal_client/literal/types/options"
require_relative "seed_literal_client/literal/types/undiscriminated_options"
require "faraday"
require_relative "seed_literal_client/literal/client"
require "async/http/faraday"

module SeedLiteralClient
  class Client
    attr_reader :literal_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @literal_client = Literal::LiteralClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_literal_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_literal_client = Literal::AsyncLiteralClient.new(request_client: request_client)
    end
  end
end
