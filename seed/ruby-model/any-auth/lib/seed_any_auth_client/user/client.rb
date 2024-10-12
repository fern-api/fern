# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "json"
require "async"

module SeedAnyAuthClient
  class UserClient
    # @return [SeedAnyAuthClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedAnyAuthClient::RequestClient]
    # @return [SeedAnyAuthClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedAnyAuthClient::RequestOptions]
    # @return [Array<SeedAnyAuthClient::User::User>]
    # @example
    #  any_auth = SeedAnyAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    token: "YOUR_AUTH_TOKEN",
    #    api_key: "YOUR_API_KEY"
    #  )
    #  any_auth.user.get
    def get(request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-API-Key"] = request_options.api_key unless request_options&.api_key.nil?
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
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedAnyAuthClient::User::User.from_json(json_object: item)
      end
    end
  end

  class AsyncUserClient
    # @return [SeedAnyAuthClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedAnyAuthClient::AsyncRequestClient]
    # @return [SeedAnyAuthClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedAnyAuthClient::RequestOptions]
    # @return [Array<SeedAnyAuthClient::User::User>]
    # @example
    #  any_auth = SeedAnyAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    token: "YOUR_AUTH_TOKEN",
    #    api_key: "YOUR_API_KEY"
    #  )
    #  any_auth.user.get
    def get(request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-API-Key"] = request_options.api_key unless request_options&.api_key.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedAnyAuthClient::User::User.from_json(json_object: item)
        end
      end
    end
  end
end
