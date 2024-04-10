# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/user"
require "async"

module SeedQueryParametersClient
  class UserClient
    attr_reader :request_client

    # @param request_client [SeedQueryParametersClient::RequestClient]
    # @return [SeedQueryParametersClient::UserClient]
    def initialize(request_client:)
      # @type [SeedQueryParametersClient::RequestClient]
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [String]
    # @param key_value [String]
    # @param optional_string [String]
    # @param nested_user [String]
    # @param optional_user [String]
    # @param exclude_user [String]
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, filter:, user: nil, key_value: nil, optional_string: nil,
                     nested_user: nil, optional_user: nil, exclude_user: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "limit": limit,
          "id": id,
          "date": date,
          "deadline": deadline,
          "bytes": bytes,
          "user": user,
          "keyValue": key_value,
          "optionalString": optional_string,
          "nestedUser": nested_user,
          "optionalUser": optional_user,
          "excludeUser": exclude_user,
          "filter": filter
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/user"
      end
      SeedQueryParametersClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    attr_reader :request_client

    # @param request_client [SeedQueryParametersClient::AsyncRequestClient]
    # @return [SeedQueryParametersClient::AsyncUserClient]
    def initialize(request_client:)
      # @type [SeedQueryParametersClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [String]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param user [String]
    # @param key_value [String]
    # @param optional_string [String]
    # @param nested_user [String]
    # @param optional_user [String]
    # @param exclude_user [String]
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, filter:, user: nil, key_value: nil, optional_string: nil,
                     nested_user: nil, optional_user: nil, exclude_user: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "limit": limit,
            "id": id,
            "date": date,
            "deadline": deadline,
            "bytes": bytes,
            "user": user,
            "keyValue": key_value,
            "optionalString": optional_string,
            "nestedUser": nested_user,
            "optionalUser": optional_user,
            "excludeUser": exclude_user,
            "filter": filter
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/user"
        end
        SeedQueryParametersClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
