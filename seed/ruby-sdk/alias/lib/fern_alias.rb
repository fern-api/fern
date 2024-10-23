# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"

module SeedAliasClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAliasClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedAliasClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param type_id [String]
    # @param request_options [SeedAliasClient::RequestOptions]
    # @return [Void]
    # @example
    #  alias_ = SeedAliasClient::Client.new(base_url: "https://api.example.com")
    #  alias_.get(type_id: "typeId")
    def get(type_id:, request_options: nil)
      @request_client.conn.get do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/#{type_id}"
      end
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAliasClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedAliasClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param type_id [String]
    # @param request_options [SeedAliasClient::RequestOptions]
    # @return [Void]
    # @example
    #  alias_ = SeedAliasClient::Client.new(base_url: "https://api.example.com")
    #  alias_.get(type_id: "typeId")
    def get(type_id:, request_options: nil)
      @async_request_client.conn.get do |req|
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
        req.url "#{@async_request_client.get_url(request_options: request_options)}/#{type_id}"
      end
    end
  end
end
