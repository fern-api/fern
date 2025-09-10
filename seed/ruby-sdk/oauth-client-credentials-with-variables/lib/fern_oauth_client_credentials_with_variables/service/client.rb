# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedOauthClientCredentialsWithVariablesClient
  class ServiceClient
    # @return [SeedOauthClientCredentialsWithVariablesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsWithVariablesClient::RequestClient]
    # @return [SeedOauthClientCredentialsWithVariablesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param endpoint_param [String]
    # @param request_options [SeedOauthClientCredentialsWithVariablesClient::RequestOptions]
    # @return [Void]
    # @example
    #  oauth_client_credentials_with_variables = SeedOauthClientCredentialsWithVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_with_variables.service.post(endpoint_param: "endpointParam")
    def post(endpoint_param:, request_options: nil)
      @request_client.conn.post do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/service/#{endpoint_param}"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsWithVariablesClient::AsyncRequestClient]
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param endpoint_param [String]
    # @param request_options [SeedOauthClientCredentialsWithVariablesClient::RequestOptions]
    # @return [Void]
    # @example
    #  oauth_client_credentials_with_variables = SeedOauthClientCredentialsWithVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_with_variables.service.post(endpoint_param: "endpointParam")
    def post(endpoint_param:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/service/#{endpoint_param}"
        end
      end
    end
  end
end
