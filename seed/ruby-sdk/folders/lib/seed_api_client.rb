# frozen_string_literal: true
require_relative "types_export"
require_relative "requests"
require_relative "seed_api_client/a/client"
require_relative "seed_api_client/folder/client"
require_relative "requests"
require_relative "seed_api_client/a/client"

module SeedApiClient
  class Client
    attr_reader :a, :
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long] 
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @a = A::Client.new(request_client: @request_client)
      @ = Folder::Client.new(request_client: @request_client)
    end
    # @param request_options [RequestOptions] 
    # @return [Void]
    def foo(request_options: nil)
      response = @request_client.conn.post("/") do | req |
  unless request_options&.timeout_in_seconds.nil?
    req.options.timeout = request_options.timeout_in_seconds
  end
  req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
end
    end
  end
  class AsyncClient
    attr_reader :a, :
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long] 
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @a = A::AsyncClient.new(request_client: @async_request_client)
      @ = Folder::AsyncClient.new(request_client: @async_request_client)
    end
    # @param request_options [RequestOptions] 
    # @return [Void]
    def foo(request_options: nil)
      response = @async_request_client.conn.post("/") do | req |
  unless request_options&.timeout_in_seconds.nil?
    req.options.timeout = request_options.timeout_in_seconds
  end
  req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
end
    end
  end
end