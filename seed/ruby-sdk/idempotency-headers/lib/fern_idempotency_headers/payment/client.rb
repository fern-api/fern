# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/currency"
require "async"

module SeedIdempotencyHeadersClient
  class PaymentClient
    # @return [SeedIdempotencyHeadersClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedIdempotencyHeadersClient::RequestClient]
    # @return [SeedIdempotencyHeadersClient::PaymentClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param amount [Integer]
    # @param currency [SeedIdempotencyHeadersClient::Payment::Currency]
    # @param request_options [SeedIdempotencyHeadersClient::IdempotencyRequestOptions]
    # @return [String]
    # @example
    #   require "fern_idempotency_headers"
    #
    # idempotency_headers = class RequestClient
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
    #  # @return [SeedIdempotencyHeadersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_idempotency_headers', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
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
    #  # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # idempotency_headers.create
    def create(amount:, currency:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
        unless request_options&.idempotency_expiration.nil?
          req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
        end
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), amount: amount, currency: currency }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/payment"
      end
      response.body
    end

    # @param payment_id [String]
    # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_idempotency_headers"
    #
    # idempotency_headers = class RequestClient
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
    #  # @return [SeedIdempotencyHeadersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_idempotency_headers', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
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
    #  # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # idempotency_headers.delete
    def delete(payment_id:, request_options: nil)
      @request_client.conn.delete do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/payment/#{payment_id}"
      end
    end
  end

  class AsyncPaymentClient
    # @return [SeedIdempotencyHeadersClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedIdempotencyHeadersClient::AsyncRequestClient]
    # @return [SeedIdempotencyHeadersClient::AsyncPaymentClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param amount [Integer]
    # @param currency [SeedIdempotencyHeadersClient::Payment::Currency]
    # @param request_options [SeedIdempotencyHeadersClient::IdempotencyRequestOptions]
    # @return [String]
    # @example
    #   require "fern_idempotency_headers"
    #
    # idempotency_headers = class RequestClient
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
    #  # @return [SeedIdempotencyHeadersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_idempotency_headers', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
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
    #  # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # idempotency_headers.create
    def create(amount:, currency:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
          unless request_options&.idempotency_expiration.nil?
            req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
          end
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            amount: amount,
            currency: currency
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/payment"
        end
        response.body
      end
    end

    # @param payment_id [String]
    # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_idempotency_headers"
    #
    # idempotency_headers = class RequestClient
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
    #  # @return [SeedIdempotencyHeadersClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil,
    #  token:)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_idempotency_headers', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
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
    #  # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # idempotency_headers.delete
    def delete(payment_id:, request_options: nil)
      Async do
        @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/payment/#{payment_id}"
        end
      end
    end
  end
end
