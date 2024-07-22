# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_folders/a/client"
require_relative "fern_folders/folder/client"

module SeedApiClient
  class Client
    # @return [SeedApiClient::A::Client]
    attr_reader :a
    # @return [SeedApiClient::Folder::FolderClient]
    attr_reader :folder

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedApiClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @a = SeedApiClient::A::Client.new(request_client: @request_client)
      @folder = SeedApiClient::Folder::FolderClient.new(request_client: @request_client)
    end

    # @param request_options [SeedApiClient::RequestOptions]
    # @return [Void]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.foo
    def foo(request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end
  end

  class AsyncClient
    # @return [SeedApiClient::A::AsyncClient]
    attr_reader :a
    # @return [SeedApiClient::Folder::AsyncFolderClient]
    attr_reader :folder

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedApiClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @a = SeedApiClient::A::AsyncClient.new(request_client: @async_request_client)
      @folder = SeedApiClient::Folder::AsyncFolderClient.new(request_client: @async_request_client)
    end

    # @param request_options [SeedApiClient::RequestOptions]
    # @return [Void]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.foo
    def foo(request_options: nil)
      @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@async_request_client.get_url(request_options: request_options)}/"
      end
    end
  end
end
