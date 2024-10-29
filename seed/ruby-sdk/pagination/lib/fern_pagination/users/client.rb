# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/order"
require_relative "types/list_users_pagination_response"
require_relative "types/with_cursor"
require_relative "types/with_page"
require_relative "types/list_users_extended_response"
require_relative "types/list_users_extended_optional_list_response"
require_relative "../types/username_cursor"
require_relative "types/username_container"
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

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [SeedPaginationClient::Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_cursor_pagination(
    #    page: 1,
    #    per_page: 1,
    #    order: ASC,
    #    starting_after: "starting_after"
    #  )
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
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
          "page": page,
          "per_page": per_page,
          "order": order,
          "starting_after": starting_after
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param pagination [Hash] The object that contains the cursor used for pagination
    #  in order to fetch the next page of results.Request of type SeedPaginationClient::Users::WithCursor, as a Hash
    #   * :cursor (String)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_body_cursor_pagination(pagination: { cursor: "cursor" })
    def list_with_body_cursor_pagination(pagination: nil, request_options: nil)
      response = @request_client.conn.post do |req|
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
        req.body = { **(request_options&.additional_body_parameters || {}), pagination: pagination }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [SeedPaginationClient::Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_pagination(
    #    page: 1,
    #    per_page: 1,
    #    order: ASC,
    #    starting_after: "starting_after"
    #  )
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
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
          "page": page,
          "per_page": per_page,
          "order": order,
          "starting_after": starting_after
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param pagination [Hash] The object that contains the offset used for pagination
    #  in order to fetch the next page of results.Request of type SeedPaginationClient::Users::WithPage, as a Hash
    #   * :page (Integer)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_body_offset_pagination(pagination: { page: 1 })
    def list_with_body_offset_pagination(pagination: nil, request_options: nil)
      response = @request_client.conn.post do |req|
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
        req.body = { **(request_options&.additional_body_parameters || {}), pagination: pagination }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param page [Integer] Defaults to first page
    # @param limit [Integer] The maxiumum number of elements to return.
    #  This is also used as the step size in this
    #  paginated endpoint.
    # @param order [SeedPaginationClient::Users::Order]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_step_pagination(
    #    page: 1,
    #    limit: 1,
    #    order: ASC
    #  )
    def list_with_offset_step_pagination(page: nil, limit: nil, order: nil, request_options: nil)
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
          "page": page,
          "limit": limit,
          "order": order
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param page [Integer] Defaults to first page
    # @param limit [Integer] The maxiumum number of elements to return.
    #  This is also used as the step size in this
    #  paginated endpoint.
    # @param order [SeedPaginationClient::Users::Order]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_pagination_has_next_page(
    #    page: 1,
    #    limit: 1,
    #    order: ASC
    #  )
    def list_with_offset_pagination_has_next_page(page: nil, limit: nil, order: nil, request_options: nil)
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
          "page": page,
          "limit": limit,
          "order": order
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_extended_results(cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def list_with_extended_results(cursor: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersExtendedResponse.from_json(json_object: response.body)
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedOptionalListResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_extended_results_and_optional_data(cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def list_with_extended_results_and_optional_data(cursor: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersExtendedOptionalListResponse.from_json(json_object: response.body)
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_usernames(starting_after: "starting_after")
    def list_usernames(starting_after: nil, request_options: nil)
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

    # @param offset [Integer]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::UsernameContainer]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_global_config(offset: 1)
    def list_with_global_config(offset: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::UsernameContainer.from_json(json_object: response.body)
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

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [SeedPaginationClient::Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_cursor_pagination(
    #    page: 1,
    #    per_page: 1,
    #    order: ASC,
    #    starting_after: "starting_after"
    #  )
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
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
            "page": page,
            "per_page": per_page,
            "order": order,
            "starting_after": starting_after
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param pagination [Hash] The object that contains the cursor used for pagination
    #  in order to fetch the next page of results.Request of type SeedPaginationClient::Users::WithCursor, as a Hash
    #   * :cursor (String)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_body_cursor_pagination(pagination: { cursor: "cursor" })
    def list_with_body_cursor_pagination(pagination: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
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
          req.body = { **(request_options&.additional_body_parameters || {}), pagination: pagination }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param page [Integer] Defaults to first page
    # @param per_page [Integer] Defaults to per page
    # @param order [SeedPaginationClient::Users::Order]
    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_pagination(
    #    page: 1,
    #    per_page: 1,
    #    order: ASC,
    #    starting_after: "starting_after"
    #  )
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
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
            "page": page,
            "per_page": per_page,
            "order": order,
            "starting_after": starting_after
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param pagination [Hash] The object that contains the offset used for pagination
    #  in order to fetch the next page of results.Request of type SeedPaginationClient::Users::WithPage, as a Hash
    #   * :page (Integer)
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_body_offset_pagination(pagination: { page: 1 })
    def list_with_body_offset_pagination(pagination: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
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
          req.body = { **(request_options&.additional_body_parameters || {}), pagination: pagination }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param page [Integer] Defaults to first page
    # @param limit [Integer] The maxiumum number of elements to return.
    #  This is also used as the step size in this
    #  paginated endpoint.
    # @param order [SeedPaginationClient::Users::Order]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_step_pagination(
    #    page: 1,
    #    limit: 1,
    #    order: ASC
    #  )
    def list_with_offset_step_pagination(page: nil, limit: nil, order: nil, request_options: nil)
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
            "page": page,
            "limit": limit,
            "order": order
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param page [Integer] Defaults to first page
    # @param limit [Integer] The maxiumum number of elements to return.
    #  This is also used as the step size in this
    #  paginated endpoint.
    # @param order [SeedPaginationClient::Users::Order]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_offset_pagination_has_next_page(
    #    page: 1,
    #    limit: 1,
    #    order: ASC
    #  )
    def list_with_offset_pagination_has_next_page(page: nil, limit: nil, order: nil, request_options: nil)
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
            "page": page,
            "limit": limit,
            "order": order
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_extended_results(cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def list_with_extended_results(cursor: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersExtendedResponse.from_json(json_object: response.body)
      end
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedOptionalListResponse]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_extended_results_and_optional_data(cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    def list_with_extended_results_and_optional_data(cursor: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersExtendedOptionalListResponse.from_json(json_object: response.body)
      end
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_usernames(starting_after: "starting_after")
    def list_usernames(starting_after: nil, request_options: nil)
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

    # @param offset [Integer]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::UsernameContainer]
    # @example
    #  pagination = SeedPaginationClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  pagination.users.list_with_global_config(offset: 1)
    def list_with_global_config(offset: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::UsernameContainer.from_json(json_object: response.body)
      end
    end
  end
end
