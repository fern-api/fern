# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/order"
require_relative "types/list_users_pagination_response"
require_relative "types/list_users_extended_response"
require_relative "../types/username_cursor"
require_relative "types/username_container"
require "async"

module SeedPaginationClient
  class UsersClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [UsersClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersPaginationResponse]
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      response = @request_client.conn.get("/users") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page": page,
          "per_page": per_page,
          "order": order,
          "starting_after": starting_after
        }.compact
      end
      Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersPaginationResponse]
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      response = @request_client.conn.get("/users") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page": page,
          "per_page": per_page,
          "order": order,
          "starting_after": starting_after
        }.compact
      end
      Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param cursor [String]
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersExtendedResponse]
    def list_with_extended_results(cursor: nil, request_options: nil)
      response = @request_client.conn.get("/users") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
      end
      Users::ListUsersExtendedResponse.from_json(json_object: response.body)
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [UsernameCursor]
    def list_usernames(starting_after: nil, request_options: nil)
      response = @request_client.conn.get("/users") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "starting_after": starting_after
        }.compact
      end
      UsernameCursor.from_json(json_object: response.body)
    end

    # @param offset [Integer]
    # @param request_options [RequestOptions]
    # @return [Users::UsernameContainer]
    def list_with_global_config(offset: nil, request_options: nil)
      response = @request_client.conn.get("/users") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
      end
      Users::UsernameContainer.from_json(json_object: response.body)
    end
  end

  class AsyncUsersClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncUsersClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersPaginationResponse]
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/users") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page": page,
            "per_page": per_page,
            "order": order,
            "starting_after": starting_after
          }.compact
        end
        Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersPaginationResponse]
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/users") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page": page,
            "per_page": per_page,
            "order": order,
            "starting_after": starting_after
          }.compact
        end
        Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param cursor [String]
    # @param request_options [RequestOptions]
    # @return [Users::ListUsersExtendedResponse]
    def list_with_extended_results(cursor: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/users") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
        end
        Users::ListUsersExtendedResponse.from_json(json_object: response.body)
      end
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #   the next page of results.
    # @param request_options [RequestOptions]
    # @return [UsernameCursor]
    def list_usernames(starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/users") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "starting_after": starting_after
          }.compact
        end
        UsernameCursor.from_json(json_object: response.body)
      end
    end

    # @param offset [Integer]
    # @param request_options [RequestOptions]
    # @return [Users::UsernameContainer]
    def list_with_global_config(offset: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/users") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
        end
        Users::UsernameContainer.from_json(json_object: response.body)
      end
    end
  end
end
