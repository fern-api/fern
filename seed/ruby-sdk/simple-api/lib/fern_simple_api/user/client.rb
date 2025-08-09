# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "async"

module SeedSimpleApiClient
  class UserClient
    # @return [SeedSimpleApiClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedSimpleApiClient::RequestClient]
    # @return [SeedSimpleApiClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param request_options [SeedSimpleApiClient::RequestOptions]
    # @return [SeedSimpleApiClient::User::User]
    # @example
    #  simple_api = SeedSimpleApiClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  simple_api.user.get(id: "id")
    def get(id:, request_options: nil)
      response = @request_client.conn.get do |req|
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
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users/#{id}"
      end
      SeedSimpleApiClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedSimpleApiClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedSimpleApiClient::AsyncRequestClient]
    # @return [SeedSimpleApiClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param id [String]
    # @param request_options [SeedSimpleApiClient::RequestOptions]
    # @return [SeedSimpleApiClient::User::User]
    # @example
    #  simple_api = SeedSimpleApiClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  simple_api.user.get(id: "id")
    def get(id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users/#{id}"
        end
        SeedSimpleApiClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
