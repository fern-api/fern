# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/search_request"
require_relative "types/paginated_conversation_response"
require "async"

module SeedPaginationClient
  class ComplexClient
    # @return [SeedPaginationClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPaginationClient::RequestClient]
    # @return [SeedPaginationClient::ComplexClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedPaginationClient::Complex::SearchRequest, as a Hash
    #   * :pagination (Hash)
    #     * :per_page (Integer)
    #     * :starting_after (String)
    #   * :query (Hash)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Complex::PaginatedConversationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.complex.search(request: { pagination: { per_page: 1, starting_after: "starting_after" }, query: { field: "field", operator: EQUALS, value: "value" } })
    def search(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/conversations/search"
      end
      SeedPaginationClient::Complex::PaginatedConversationResponse.from_json(json_object: response.body)
    end
  end

  class AsyncComplexClient
    # @return [SeedPaginationClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPaginationClient::AsyncRequestClient]
    # @return [SeedPaginationClient::AsyncComplexClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedPaginationClient::Complex::SearchRequest, as a Hash
    #   * :pagination (Hash)
    #     * :per_page (Integer)
    #     * :starting_after (String)
    #   * :query (Hash)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Complex::PaginatedConversationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.complex.search(request: { pagination: { per_page: 1, starting_after: "starting_after" }, query: { field: "field", operator: EQUALS, value: "value" } })
    def search(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/conversations/search"
        end
        SeedPaginationClient::Complex::PaginatedConversationResponse.from_json(json_object: response.body)
      end
    end
  end
end
