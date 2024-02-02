# frozen_string_literal: true

require "faraday"
require_relative "seed_objects_with_imports_client/optional/client"
require "async/http/faraday"

module SeedObjectsWithImportsClient
  class Client
    attr_reader :optional_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @optional_client = Optional::OptionalClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_optional_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_optional_client = Optional::AsyncOptionalClient.new(request_client: request_client)
    end
  end
end
