# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedErrorPropertyClient
  class PropertyBasedErrorClient
    # @return [SeedErrorPropertyClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedErrorPropertyClient::RequestClient]
    # @return [SeedErrorPropertyClient::PropertyBasedErrorClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [SeedErrorPropertyClient::RequestOptions]
    # @return [String]
    # @example
    #  error_property = SeedErrorPropertyClient::Client.new(base_url: "https://api.example.com")
    #  error_property.property_based_error.throw_error
    def throw_error(request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/property-based-error"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncPropertyBasedErrorClient
    # @return [SeedErrorPropertyClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedErrorPropertyClient::AsyncRequestClient]
    # @return [SeedErrorPropertyClient::AsyncPropertyBasedErrorClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request that always throws an error
    #
    # @param request_options [SeedErrorPropertyClient::RequestOptions]
    # @return [String]
    # @example
    #  error_property = SeedErrorPropertyClient::Client.new(base_url: "https://api.example.com")
    #  error_property.property_based_error.throw_error
    def throw_error(request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/property-based-error"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
