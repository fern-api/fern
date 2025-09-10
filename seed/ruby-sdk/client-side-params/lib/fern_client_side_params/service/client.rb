# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/types/resource"
require "json"
require_relative "../types/types/search_response"
require "async"

module SeedClientSideParamsClient
  class ServiceClient
    # @return [SeedClientSideParamsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedClientSideParamsClient::RequestClient]
    # @return [SeedClientSideParamsClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # List resources with pagination
    #
    # @param page [Integer] Zero-indexed page number
    # @param per_page [Integer] Number of items per page
    # @param sort [String] Sort field
    # @param order [String] Sort order (asc or desc)
    # @param include_totals [Boolean] Whether to include total count
    # @param fields [String] Comma-separated list of fields to include
    # @param search [String] Search query
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [Array<SeedClientSideParamsClient::Types::Resource>]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.list_resources(
    #    page: 1,
    #    per_page: 1,
    #    sort: "created_at",
    #    order: "desc",
    #    include_totals: true,
    #    fields: "fields",
    #    search: "search"
    #  )
    def list_resources(page:, per_page:, sort:, order:, include_totals:, fields: nil, search: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page": page,
          "per_page": per_page,
          "sort": sort,
          "order": order,
          "include_totals": include_totals,
          "fields": fields,
          "search": search
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/api/resources"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedClientSideParamsClient::Types::Resource.from_json(json_object: item)
      end
    end

    # Get a single resource
    #
    # @param resource_id [String]
    # @param include_metadata [Boolean] Include metadata in response
    # @param format [String] Response format
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [SeedClientSideParamsClient::Types::Resource]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.get_resource(
    #    resource_id: "resourceId",
    #    include_metadata: true,
    #    format: "json"
    #  )
    def get_resource(resource_id:, include_metadata:, format:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "include_metadata": include_metadata,
          "format": format
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/api/resources/#{resource_id}"
      end
      SeedClientSideParamsClient::Types::Resource.from_json(json_object: response.body)
    end

    # Search resources with complex parameters
    #
    # @param limit [Integer] Maximum results to return
    # @param offset [Integer] Offset for pagination
    # @param query [String]
    # @param filters [Hash{String => Object}]
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [SeedClientSideParamsClient::Types::SearchResponse]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.search_resources(
    #    limit: 1,
    #    offset: 1,
    #    query: "query",
    #    filters: { "filters": {"key":"value"} }
    #  )
    def search_resources(limit:, offset:, query:, filters: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "limit": limit,
          "offset": offset
        }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), query: query, filters: filters }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/api/resources/search"
      end
      SeedClientSideParamsClient::Types::SearchResponse.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedClientSideParamsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedClientSideParamsClient::AsyncRequestClient]
    # @return [SeedClientSideParamsClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # List resources with pagination
    #
    # @param page [Integer] Zero-indexed page number
    # @param per_page [Integer] Number of items per page
    # @param sort [String] Sort field
    # @param order [String] Sort order (asc or desc)
    # @param include_totals [Boolean] Whether to include total count
    # @param fields [String] Comma-separated list of fields to include
    # @param search [String] Search query
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [Array<SeedClientSideParamsClient::Types::Resource>]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.list_resources(
    #    page: 1,
    #    per_page: 1,
    #    sort: "created_at",
    #    order: "desc",
    #    include_totals: true,
    #    fields: "fields",
    #    search: "search"
    #  )
    def list_resources(page:, per_page:, sort:, order:, include_totals:, fields: nil, search: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page": page,
            "per_page": per_page,
            "sort": sort,
            "order": order,
            "include_totals": include_totals,
            "fields": fields,
            "search": search
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/api/resources"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedClientSideParamsClient::Types::Resource.from_json(json_object: item)
        end
      end
    end

    # Get a single resource
    #
    # @param resource_id [String]
    # @param include_metadata [Boolean] Include metadata in response
    # @param format [String] Response format
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [SeedClientSideParamsClient::Types::Resource]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.get_resource(
    #    resource_id: "resourceId",
    #    include_metadata: true,
    #    format: "json"
    #  )
    def get_resource(resource_id:, include_metadata:, format:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "include_metadata": include_metadata,
            "format": format
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/api/resources/#{resource_id}"
        end
        SeedClientSideParamsClient::Types::Resource.from_json(json_object: response.body)
      end
    end

    # Search resources with complex parameters
    #
    # @param limit [Integer] Maximum results to return
    # @param offset [Integer] Offset for pagination
    # @param query [String]
    # @param filters [Hash{String => Object}]
    # @param request_options [SeedClientSideParamsClient::RequestOptions]
    # @return [SeedClientSideParamsClient::Types::SearchResponse]
    # @example
    #  client_side_params = SeedClientSideParamsClient::Client.new(base_url: "https://api.example.com")
    #  client_side_params.service.search_resources(
    #    limit: 1,
    #    offset: 1,
    #    query: "query",
    #    filters: { "filters": {"key":"value"} }
    #  )
    def search_resources(limit:, offset:, query:, filters: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "limit": limit,
            "offset": offset
          }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), query: query, filters: filters }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/api/resources/search"
        end
        SeedClientSideParamsClient::Types::SearchResponse.from_json(json_object: response.body)
      end
    end
  end
end
