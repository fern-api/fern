# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"

module SeedAliasExtendsClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAliasExtendsClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedAliasExtendsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param child [String]
    # @param request_options [SeedAliasExtendsClient::RequestOptions]
    # @return [Void]
    # @example
    #  alias_extends = SeedAliasExtendsClient::Client.new(base_url: "https://api.example.com")
    #  alias_extends.extended_inline_request_body(child: "child")
    def extended_inline_request_body(child:, request_options: nil)
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
        req.body = { **(request_options&.additional_body_parameters || {}), child: child }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/extends/extended-inline-request-body"
      end
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAliasExtendsClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedAliasExtendsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param child [String]
    # @param request_options [SeedAliasExtendsClient::RequestOptions]
    # @return [Void]
    # @example
    #  alias_extends = SeedAliasExtendsClient::Client.new(base_url: "https://api.example.com")
    #  alias_extends.extended_inline_request_body(child: "child")
    def extended_inline_request_body(child:, request_options: nil)
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
        req.body = { **(request_options&.additional_body_parameters || {}), child: child }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/extends/extended-inline-request-body"
      end
    end
  end
end
