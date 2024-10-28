# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/user"
require_relative "types/nested_user"
require "async"

module SeedQueryParametersClient
  class UserClient
    # @return [SeedQueryParametersClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedQueryParametersClient::RequestClient]
    # @return [SeedQueryParametersClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Array<Hash>] Request of type Array<SeedQueryParametersClient::User::User>, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedQueryParametersClient::User::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, user:, user_list:, key_value:, nested_user:, exclude_user:, filter:, optional_deadline: nil,
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
          "filter": filter
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/user"
      end
      SeedQueryParametersClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedQueryParametersClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedQueryParametersClient::AsyncRequestClient]
    # @return [SeedQueryParametersClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param user_list [Array<Hash>] Request of type Array<SeedQueryParametersClient::User::User>, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param optional_deadline [DateTime]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param nested_user [Hash] Request of type SeedQueryParametersClient::User::NestedUser, as a Hash
    #   * :name (String)
    #   * :user (Hash)
    #     * :name (String)
    #     * :tags (Array<String>)
    # @param optional_user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param exclude_user [Hash] Request of type SeedQueryParametersClient::User::User, as a Hash
    #   * :name (String)
    #   * :tags (Array<String>)
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, user:, user_list:, key_value:, nested_user:, exclude_user:, filter:, optional_deadline: nil,
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
            "filter": filter
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/user"
        end
        SeedQueryParametersClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
