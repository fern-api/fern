# frozen_string_literal: true

require_relative "seed_api_client/a/d/types/types/foo"
require "faraday"
require_relative "seed_api_client/a/b/client"
require_relative "seed_api_client/a/c/client"
require_relative "seed_api_client/aclient"
require_relative "seed_api_client/folder/client"
require "async/http/faraday"

module SeedApiClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @client = Client.initialize(request_client: request_client)
      @client = Client.initialize(request_client: request_client)
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def foo(request_options: nil)
      request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
      end
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_client = AsyncClient.initialize(client: request_client)
      @async_client = AsyncClient.initialize(request_client: request_client)
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def foo(request_options: nil)
      request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
      end
    end
  end
end
