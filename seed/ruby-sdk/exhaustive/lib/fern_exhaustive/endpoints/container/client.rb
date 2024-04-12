# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/object/types/object_with_required_field"
require "set"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ContainerClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::ContainerClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<String>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_list_of_primitives
      def get_and_return_list_of_primitives(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-primitives"
        end
        response.body
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_list_of_objects
      def get_and_return_list_of_objects(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-objects"
        end
        response.body&.map do |v|
          v = v.to_json
          SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: v)
        end
      end

      # @param request [Set<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<String>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_set_of_primitives
      def get_and_return_set_of_primitives(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-primitives"
        end
        Set.new(response.body)
      end

      # @param request [Set<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_set_of_objects
      def get_and_return_set_of_objects(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-objects"
        end
        Set.new(response.body)
      end

      # @param request [Hash{String => String}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => String}]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_map_prim_to_prim
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-prim"
        end
        response.body
      end

      # @param request [Hash{String => SeedExhaustiveClient::Types::Object::ObjectWithRequiredField}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => SeedExhaustiveClient::Types::Object::ObjectWithRequiredField}]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_map_of_prim_to_object
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-object"
        end
        response.body&.transform_values do |v|
          v = v.to_json
          SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: v)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithRequiredField]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_optional
      def get_and_return_optional(request: nil, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/container/opt-objects"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
      end
    end

    class AsyncContainerClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncContainerClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request [Array<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<String>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_list_of_primitives
      def get_and_return_list_of_primitives(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-primitives"
          end
          response.body
        end
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Array<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_list_of_objects
      def get_and_return_list_of_objects(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/list-of-objects"
          end
          response.body&.map do |v|
            v = v.to_json
            SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: v)
          end
        end
      end

      # @param request [Set<String>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<String>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_set_of_primitives
      def get_and_return_set_of_primitives(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-primitives"
          end
          Set.new(response.body)
        end
      end

      # @param request [Set<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Set<SeedExhaustiveClient::Types::Object::ObjectWithRequiredField>]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_set_of_objects
      def get_and_return_set_of_objects(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/set-of-objects"
          end
          Set.new(response.body)
        end
      end

      # @param request [Hash{String => String}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => String}]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_map_prim_to_prim
      def get_and_return_map_prim_to_prim(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-prim"
          end
          response.body
        end
      end

      # @param request [Hash{String => SeedExhaustiveClient::Types::Object::ObjectWithRequiredField}]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Hash{String => SeedExhaustiveClient::Types::Object::ObjectWithRequiredField}]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_map_of_prim_to_object
      def get_and_return_map_of_prim_to_object(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/map-prim-to-object"
          end
          response.body&.transform_values do |v|
            v = v.to_json
            SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: v)
          end
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithRequiredField]
      # @example
      #   require "fern_exhaustive"
      #
      # exhaustive = class RequestClient
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
      #  # @return [SeedExhaustiveClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
      #  token:)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
      #  'fern_exhaustive', "X-Fern-SDK-Version": '0.0.1', "Authorization": 'Bearer
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
      #  # @param request_options [SeedExhaustiveClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # exhaustive.endpoints.get_and_return_optional
      def get_and_return_optional(request: nil, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/container/opt-objects"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
        end
      end
    end
  end
end
