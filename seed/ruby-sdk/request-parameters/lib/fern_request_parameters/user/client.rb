# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/user"
require_relative "types/nested_user"
require "async"

module SeedRequestParametersClient
  class UserClient
    # @return [SeedRequestParametersClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedRequestParametersClient::RequestClient]
    # @return [SeedRequestParametersClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param username [String]
    # @param password [String]
    # @param name [String]
    # @param request_options [SeedRequestParametersClient::RequestOptions]
    # @return [Void]
    # @example
    #  request_parameters = SeedRequestParametersClient::Client.new(base_url: "https://api.example.com")
    #  request_parameters.user.create_username(
    #    username: "username",
    #    password: "password",
    #    name: "test"
    #  )
    def create_username(username:, password:, name:, request_options: nil)
      @request_client.conn.post do |req|
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
          password: password,
          name: name
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/user/username"
      end
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Array<Hash>] Request of type Array<SeedRequestParametersClient::User::User>, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedRequestParametersClient::User::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param long_param [Long]
    # @param big_int_param [String]
    # @param request_options [SeedRequestParametersClient::RequestOptions]
    # @return [SeedRequestParametersClient::User::User]
    # @example
    #  request_parameters = SeedRequestParametersClient::Client.new(base_url: "https://api.example.com")
    #  request_parameters.user.get_username(
    #    limit: 1,
    #    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    date: Date.parse("2023-01-15"),
    #    deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    bytes: "SGVsbG8gd29ybGQh",
    #    user: { name: "name", tags: ["tags", "tags"] },
    #    user_list: [{ name: "name", tags: ["tags", "tags"] }, { name: "name", tags: ["tags", "tags"] }],
    #    optional_deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    key_value: { "keyValue": "keyValue" },
    #    optional_string: "optionalString",
    #    nested_user: { name: "name", user: { name: "name", tags: ["tags", "tags"] } },
    #    optional_user: { name: "name", tags: ["tags", "tags"] },
    #    exclude_user: { name: "name", tags: ["tags", "tags"] },
    #    filter: "filter",
    #    long_param: 1000000,
    #    big_int_param: "1000000"
    #  )
    def get_username(limit:, id:, date:, deadline:, bytes:, user:, user_list:, key_value:, nested_user:, exclude_user:, filter:, long_param:, big_int_param:, optional_deadline: nil,
                     optional_string: nil, optional_user: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "limit": limit,
          "id": id,
          "date": date,
          "deadline": deadline,
          "bytes": bytes,
          "user": user,
          "userList": user_list,
          "optionalDeadline": optional_deadline,
          "keyValue": key_value,
          "optionalString": optional_string,
          "nestedUser": nested_user,
          "optionalUser": optional_user,
          "excludeUser": exclude_user,
          "filter": filter,
          "longParam": long_param,
          "bigIntParam": big_int_param
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/user"
      end
      SeedRequestParametersClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedRequestParametersClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedRequestParametersClient::AsyncRequestClient]
    # @return [SeedRequestParametersClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param username [String]
    # @param password [String]
    # @param name [String]
    # @param request_options [SeedRequestParametersClient::RequestOptions]
    # @return [Void]
    # @example
    #  request_parameters = SeedRequestParametersClient::Client.new(base_url: "https://api.example.com")
    #  request_parameters.user.create_username(
    #    username: "username",
    #    password: "password",
    #    name: "test"
    #  )
    def create_username(username:, password:, name:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            password: password,
            name: name
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/user/username"
        end
      end
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Array<Hash>] Request of type Array<SeedRequestParametersClient::User::User>, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedRequestParametersClient::User::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedRequestParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param long_param [Long]
    # @param big_int_param [String]
    # @param request_options [SeedRequestParametersClient::RequestOptions]
    # @return [SeedRequestParametersClient::User::User]
    # @example
    #  request_parameters = SeedRequestParametersClient::Client.new(base_url: "https://api.example.com")
    #  request_parameters.user.get_username(
    #    limit: 1,
    #    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    #    date: Date.parse("2023-01-15"),
    #    deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    bytes: "SGVsbG8gd29ybGQh",
    #    user: { name: "name", tags: ["tags", "tags"] },
    #    user_list: [{ name: "name", tags: ["tags", "tags"] }, { name: "name", tags: ["tags", "tags"] }],
    #    optional_deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    key_value: { "keyValue": "keyValue" },
    #    optional_string: "optionalString",
    #    nested_user: { name: "name", user: { name: "name", tags: ["tags", "tags"] } },
    #    optional_user: { name: "name", tags: ["tags", "tags"] },
    #    exclude_user: { name: "name", tags: ["tags", "tags"] },
    #    filter: "filter",
    #    long_param: 1000000,
    #    big_int_param: "1000000"
    #  )
    def get_username(limit:, id:, date:, deadline:, bytes:, user:, user_list:, key_value:, nested_user:, exclude_user:, filter:, long_param:, big_int_param:, optional_deadline: nil,
                     optional_string: nil, optional_user: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "limit": limit,
            "id": id,
            "date": date,
            "deadline": deadline,
            "bytes": bytes,
            "user": user,
            "userList": user_list,
            "optionalDeadline": optional_deadline,
            "keyValue": key_value,
            "optionalString": optional_string,
            "nestedUser": nested_user,
            "optionalUser": optional_user,
            "excludeUser": exclude_user,
            "filter": filter,
            "longParam": long_param,
            "bigIntParam": big_int_param
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/user"
        end
        SeedRequestParametersClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
