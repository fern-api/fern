# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/shape"
require "json"
require "async"

module SeedUnionsClient
  class UnionClient
    # @return [SeedUnionsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnionsClient::RequestClient]
    # @return [SeedUnionsClient::UnionClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param request_options [SeedUnionsClient::RequestOptions]
    # @return [SeedUnionsClient::Union::Shape]
    # @example
    #  unions = SeedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  unions.union.get(id: "id")
    def get(id:, request_options: nil)
      response = @request_client.conn.get do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/#{id}"
      end
      SeedUnionsClient::Union::Shape.from_json(json_object: response.body)
    end

    # @param request [SeedUnionsClient::Union::Shape]
    # @param request_options [SeedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  unions = SeedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  unions.union.update
    def update(request:, request_options: nil)
      response = @request_client.conn.patch do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncUnionClient
    # @return [SeedUnionsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnionsClient::AsyncRequestClient]
    # @return [SeedUnionsClient::AsyncUnionClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param request_options [SeedUnionsClient::RequestOptions]
    # @return [SeedUnionsClient::Union::Shape]
    # @example
    #  unions = SeedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  unions.union.get(id: "id")
    def get(id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/#{id}"
        end
        SeedUnionsClient::Union::Shape.from_json(json_object: response.body)
      end
    end

    # @param request [SeedUnionsClient::Union::Shape]
    # @param request_options [SeedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  unions = SeedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  unions.union.update
    def update(request:, request_options: nil)
      Async do
        response = @request_client.conn.patch do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
