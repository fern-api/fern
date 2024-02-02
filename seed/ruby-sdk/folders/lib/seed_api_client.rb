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
    attr_reader :client, :client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @client = A::Client.new(request_client: request_client)
      @client = Folder::Client.new(request_client: request_client)
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
    attr_reader :async_client, :async_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_client = A::AsyncClient.new(client: request_client)
      @async_client = Folder::AsyncClient.new(request_client: request_client)
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
