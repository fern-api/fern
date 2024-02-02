# frozen_string_literal: true

require_relative "seed_unknown_as_any_client/unknown/types/my_alias"
require_relative "seed_unknown_as_any_client/unknown/types/my_object"
require "faraday"
require_relative "seed_unknown_as_any_client/unknown/client"
require "async/http/faraday"

module SeedUnknownAsAnyClient
  class Client
    attr_reader :unknown_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @unknown_client = Unknown::UnknownClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_unknown_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_unknown_client = Unknown::AsyncUnknownClient.new(request_client: request_client)
    end
  end
end
