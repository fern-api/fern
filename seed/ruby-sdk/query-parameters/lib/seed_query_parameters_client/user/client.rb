# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/user"
require "async"

module SeedQueryParametersClient
  class UserClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [UserClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [UUID]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param filter [String]
    # @param request_options [RequestOptions]
    # @return [User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, key_value:, filter:, optional_string: nil,
                     request_options: nil)
      response = @request_client.conn.get("/user") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "limit": limit,
          "id": id,
          "date": date,
          "deadline": deadline,
          "bytes": bytes,
          "keyValue": key_value,
          "optionalString": optional_string,
          "filter": filter
        }.compact
      end
      User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncUserClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param limit [Integer]
    # @param id [UUID]
    # @param date [Date]
    # @param deadline [DateTime]
    # @param bytes [String]
    # @param key_value [Hash{String => String}]
    # @param optional_string [String]
    # @param filter [String]
    # @param request_options [RequestOptions]
    # @return [User::User]
    def get_username(limit:, id:, date:, deadline:, bytes:, key_value:, filter:, optional_string: nil,
                     request_options: nil)
      Async do
        response = @request_client.conn.get("/user") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "limit": limit,
            "id": id,
            "date": date,
            "deadline": deadline,
            "bytes": bytes,
            "keyValue": key_value,
            "optionalString": optional_string,
            "filter": filter
          }.compact
        end
        User::User.from_json(json_object: response.body)
      end
    end
  end
end
