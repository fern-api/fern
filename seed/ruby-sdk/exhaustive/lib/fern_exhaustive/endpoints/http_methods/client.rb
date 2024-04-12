# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/object/types/object_with_required_field"
require_relative "../../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class HttpMethodsClient
      # @return [SeedExhaustiveClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::HttpMethodsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
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
      # exhaustive.endpoints.test_get
      def test_get(id:, request_options: nil)
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        response.body
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_post
      def test_post(request:, request_options: nil)
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_put
      def test_put(id:, request:, request_options: nil)
        response = @request_client.conn.put do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_patch
      def test_patch(id:, request:, request_options: nil)
        response = @request_client.conn.patch do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
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
      # exhaustive.endpoints.test_delete
      def test_delete(id:, request_options: nil)
        response = @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
        end
        response.body
      end
    end

    class AsyncHttpMethodsClient
      # @return [SeedExhaustiveClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncHttpMethodsClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [String]
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
      # exhaustive.endpoints.test_get
      def test_get(id:, request_options: nil)
        Async do
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          response.body
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_post
      def test_post(request:, request_options: nil)
        Async do
          response = @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_put
      def test_put(id:, request:, request_options: nil)
        Async do
          response = @request_client.conn.put do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
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
      # exhaustive.endpoints.test_patch
      def test_patch(id:, request:, request_options: nil)
        Async do
          response = @request_client.conn.patch do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param id [String]
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [Boolean]
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
      # exhaustive.endpoints.test_delete
      def test_delete(id:, request_options: nil)
        Async do
          response = @request_client.conn.delete do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/http-methods/#{id}"
          end
          response.body
        end
      end
    end
  end
end
