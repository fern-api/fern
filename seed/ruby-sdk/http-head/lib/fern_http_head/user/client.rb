# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "json"
require "async"

module SeedHttpHeadClient
  class UserClient
    # @return [SeedHttpHeadClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedHttpHeadClient::RequestClient]
    # @return [SeedHttpHeadClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param request_options [SeedHttpHeadClient::RequestOptions]
    # @return [Array<SeedHttpHeadClient::User::User>]
    # @example
    #  http_head = SeedHttpHeadClient::Client.new(base_url: "https://api.example.com")
    #  http_head.user.list(limit: 1)
    def list(limit:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "limit": limit }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedHttpHeadClient::User::User.from_json(json_object: item)
      end
    end
  end

  class AsyncUserClient
    # @return [SeedHttpHeadClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedHttpHeadClient::AsyncRequestClient]
    # @return [SeedHttpHeadClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param request_options [SeedHttpHeadClient::RequestOptions]
    # @return [Array<SeedHttpHeadClient::User::User>]
    # @example
    #  http_head = SeedHttpHeadClient::Client.new(base_url: "https://api.example.com")
    #  http_head.user.list(limit: 1)
    def list(limit:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "limit": limit }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedHttpHeadClient::User::User.from_json(json_object: item)
        end
      end
    end
  end
end
