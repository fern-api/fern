# frozen_string_literal: true

require_relative "seed_extends_client/types/docs"
require_relative "seed_extends_client/types/example_type"
require_relative "seed_extends_client/types/json"
require_relative "seed_extends_client/types/nested_type"
require "async/http/faraday"
require "faraday"

module SeedExtendsClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
    end
  end
end
