# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require "date"
require_relative "fern_query_parameters_openapi_as_objects/types/user"
require_relative "fern_query_parameters_openapi_as_objects/types/nested_user"
require_relative "fern_query_parameters_openapi_as_objects/types/search_request_neighbor"
require_relative "fern_query_parameters_openapi_as_objects/types/search_request_neighbor_required"
require_relative "fern_query_parameters_openapi_as_objects/types/search_response"

module SeedApiClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedApiClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [String]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedApiClient::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param neighbor [SeedApiClient::User, SeedApiClient::NestedUser, String, Integer]
    # @param neighbor_required [SeedApiClient::User, SeedApiClient::NestedUser, String, Integer]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::SearchResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.search(
    #    limit: 1,
    #    id: "id",
    #    date: "date",
    #    deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    bytes: "bytes",
    #    user: { name: "name", tags: ["tags", "tags"] },
    #    user_list: { name: "name", tags: ["tags", "tags"] },
    #    optional_deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    key_value: { "keyValue": "keyValue" },
    #    optional_string: "optionalString",
    #    nested_user: { name: "name", user: { name: "name", tags: ["tags", "tags"] } },
    #    optional_user: { name: "name", tags: ["tags", "tags"] },
    #    exclude_user: { name: "name", tags: ["tags", "tags"] },
    #    filter: "filter",
    #    neighbor: { name: "name", tags: ["tags", "tags"] },
    #    neighbor_required: { name: "name", tags: ["tags", "tags"] }
    #  )
    def search(limit:, id:, date:, deadline:, bytes:, user:, neighbor_required:, user_list: nil, optional_deadline: nil, key_value: nil,
               optional_string: nil, nested_user: nil, optional_user: nil, exclude_user: nil, filter: nil, neighbor: nil, request_options: nil)
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
          "neighbor": neighbor,
          "neighborRequired": neighbor_required
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/user/getUsername"
      end
      SeedApiClient::SearchResponse.from_json(json_object: response.body)
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedApiClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [String]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedApiClient::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedApiClient::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param neighbor [SeedApiClient::User, SeedApiClient::NestedUser, String, Integer]
    # @param neighbor_required [SeedApiClient::User, SeedApiClient::NestedUser, String, Integer]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::SearchResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.search(
    #    limit: 1,
    #    id: "id",
    #    date: "date",
    #    deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    bytes: "bytes",
    #    user: { name: "name", tags: ["tags", "tags"] },
    #    user_list: { name: "name", tags: ["tags", "tags"] },
    #    optional_deadline: DateTime.parse("2024-01-15T09:30:00.000Z"),
    #    key_value: { "keyValue": "keyValue" },
    #    optional_string: "optionalString",
    #    nested_user: { name: "name", user: { name: "name", tags: ["tags", "tags"] } },
    #    optional_user: { name: "name", tags: ["tags", "tags"] },
    #    exclude_user: { name: "name", tags: ["tags", "tags"] },
    #    filter: "filter",
    #    neighbor: { name: "name", tags: ["tags", "tags"] },
    #    neighbor_required: { name: "name", tags: ["tags", "tags"] }
    #  )
    def search(limit:, id:, date:, deadline:, bytes:, user:, neighbor_required:, user_list: nil, optional_deadline: nil, key_value: nil,
               optional_string: nil, nested_user: nil, optional_user: nil, exclude_user: nil, filter: nil, neighbor: nil, request_options: nil)
      response = @async_request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
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
          "neighbor": neighbor,
          "neighborRequired": neighbor_required
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@async_request_client.get_url(request_options: request_options)}/user/getUsername"
      end
      SeedApiClient::SearchResponse.from_json(json_object: response.body)
    end
  end
end
