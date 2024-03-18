# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_folders/a/client"
require_relative "fern_folders/folder/client"

module SeedApiClient
  class Client
    attr_reader :a, :folder

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @a = A::Client.new(request_client: @request_client)
      @folder = Folder::FolderClient.new(request_client: @request_client)
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def foo(request_options: nil)
      @request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
    end
  end

  class AsyncClient
    attr_reader :a, :folder

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @a = A::AsyncClient.new(request_client: @async_request_client)
      @folder = Folder::AsyncFolderClient.new(request_client: @async_request_client)
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def foo(request_options: nil)
      @async_request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
    end
  end
end
