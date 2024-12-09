# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_inline_types/types/inline_type_1"
require_relative "fern_inline_types/types/root_type_1"

module SeedObjectClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedObjectClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedObjectClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param bar [Hash] Request of type SeedObjectClient::InlineType1, as a Hash
    #   * :foo (String)
    #   * :bar (Hash)
    #     * :foo (String)
    #     * :bar (String)
    #     * :my_enum (SeedObjectClient::InlineEnum)
    # @param foo [String]
    # @param request_options [SeedObjectClient::RequestOptions]
    # @return [SeedObjectClient::RootType1]
    # @example
    #  object = SeedObjectClient::Client.new(base_url: "https://api.example.com")
    #  object.get_root(bar: { foo: "foo", bar: { foo: "foo", bar: "bar", my_enum: SUNNY } }, foo: "foo")
    def get_root(bar:, foo:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), bar: bar, foo: foo }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/root/root"
      end
      SeedObjectClient::RootType1.from_json(json_object: response.body)
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedObjectClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedObjectClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param bar [Hash] Request of type SeedObjectClient::InlineType1, as a Hash
    #   * :foo (String)
    #   * :bar (Hash)
    #     * :foo (String)
    #     * :bar (String)
    #     * :my_enum (SeedObjectClient::InlineEnum)
    # @param foo [String]
    # @param request_options [SeedObjectClient::RequestOptions]
    # @return [SeedObjectClient::RootType1]
    # @example
    #  object = SeedObjectClient::Client.new(base_url: "https://api.example.com")
    #  object.get_root(bar: { foo: "foo", bar: { foo: "foo", bar: "bar", my_enum: SUNNY } }, foo: "foo")
    def get_root(bar:, foo:, request_options: nil)
      response = @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), bar: bar, foo: foo }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/root/root"
      end
      SeedObjectClient::RootType1.from_json(json_object: response.body)
    end
  end
end
