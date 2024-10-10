# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/metadata"
require_relative "../types/create_response"
require "async"

module SeedApiClient
  class UserserviceClient
    # @return [SeedApiClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiClient::RequestClient]
    # @return [SeedApiClient::UserserviceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param username [String]
    # @param email [String]
    # @param age [Integer]
    # @param weight [Float]
    # @param metadata [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::CreateResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.userservice.create
    def create(username: nil, email: nil, age: nil, weight: nil, metadata: nil, request_options: nil)
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
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          username: username,
          email: email,
          age: age,
          weight: weight,
          metadata: metadata
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedApiClient::CreateResponse.from_json(json_object: response.body)
    end
  end

  class AsyncUserserviceClient
    # @return [SeedApiClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiClient::AsyncRequestClient]
    # @return [SeedApiClient::AsyncUserserviceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param username [String]
    # @param email [String]
    # @param age [Integer]
    # @param weight [Float]
    # @param metadata [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::CreateResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.userservice.create
    def create(username: nil, email: nil, age: nil, weight: nil, metadata: nil, request_options: nil)
      Async do
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
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            username: username,
            email: email,
            age: age,
            weight: weight,
            metadata: metadata
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedApiClient::CreateResponse.from_json(json_object: response.body)
      end
    end
  end
end
