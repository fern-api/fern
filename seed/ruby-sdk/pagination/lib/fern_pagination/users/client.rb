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
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_cursor_pagination
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      response = @request_client.conn.get do |req|
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
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_offset_pagination
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      response = @request_client.conn.get do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedResponse]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_extended_results
    def list_with_extended_results(cursor: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::Users::ListUsersExtendedResponse.from_json(json_object: response.body)
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_usernames
    def list_usernames(starting_after: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "starting_after": starting_after
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedPaginationClient::UsernameCursor.from_json(json_object: response.body)
    end

    # @param offset [Integer]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::UsernameContainer]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_global_config
    def list_with_global_config(offset: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
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
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_cursor_pagination
    def list_with_cursor_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_offset_pagination
    def list_with_offset_pagination(page: nil, per_page: nil, order: nil, starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersPaginationResponse.from_json(json_object: response.body)
      end
    end

    # @param cursor [String]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::ListUsersExtendedResponse]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_extended_results
    def list_with_extended_results(cursor: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "cursor": cursor }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::ListUsersExtendedResponse.from_json(json_object: response.body)
      end
    end

    # @param starting_after [String] The cursor used for pagination in order to fetch
    #  the next page of results.
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::UsernameCursor]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_usernames
    def list_usernames(starting_after: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "starting_after": starting_after
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::UsernameCursor.from_json(json_object: response.body)
      end
    end

    # @param offset [Integer]
    # @param request_options [SeedPaginationClient::RequestOptions]
    # @return [SeedPaginationClient::Users::UsernameContainer]
    # @example
    #   require "fern_pagination"
    #
    # pagination = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedPaginationClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_pagination', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
    #  #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedPaginationClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # pagination.list_with_global_config
    def list_with_global_config(offset: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = { **(request_options&.additional_query_parameters || {}), "offset": offset }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedPaginationClient::Users::UsernameContainer.from_json(json_object: response.body)
      end
    end
  end
end
