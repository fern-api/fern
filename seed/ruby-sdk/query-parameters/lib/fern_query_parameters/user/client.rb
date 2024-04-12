# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/user"
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
    # @param user [String]
    # @param key_value [String]
    # @param optional_string [String]
    # @param nested_user [String]
    # @param optional_user [String]
    # @param exclude_user [String]
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    # @example
    #   require "fern_query_parameters"
    #
    # query_parameters = class RequestClient
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
    #  # @return [SeedQueryParametersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_query_parameters', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedQueryParametersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # query_parameters.get_username
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
    # @param user [String]
    # @param key_value [String]
    # @param optional_string [String]
    # @param nested_user [String]
    # @param optional_user [String]
    # @param exclude_user [String]
    # @param filter [String]
    # @param request_options [SeedQueryParametersClient::RequestOptions]
    # @return [SeedQueryParametersClient::User::User]
    # @example
    #   require "fern_query_parameters"
    #
    # query_parameters = class RequestClient
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
    #  # @return [SeedQueryParametersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_query_parameters', "X-Fern-SDK-Version": '0.0.1' }
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
    #  # @param request_options [SeedQueryParametersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # query_parameters.get_username
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
