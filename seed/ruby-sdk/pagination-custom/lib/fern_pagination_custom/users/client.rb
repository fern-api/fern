# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/username_cursor"
require "async"

module SeedPaginationClient
  class UsersClient
    # @return [SeedPaginationClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPaginationClient::RequestClient]
    # @return [SeedPaginationClient::UsersClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_usernames_custom(starting_after: "starting_after")
    def list_usernames_custom(starting_after: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "starting_after": starting_after
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::UsernameCursor.from_json(json_object: response.body)
    end
  end

  class AsyncUsersClient
    # @return [SeedPaginationClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPaginationClient::AsyncRequestClient]
    # @return [SeedPaginationClient::AsyncUsersClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_usernames_custom(starting_after: "starting_after")
    def list_usernames_custom(starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "starting_after": starting_after
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::UsernameCursor.from_json(json_object: response.body)
      end
    end
  end
end
