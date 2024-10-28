# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/currency"
require "json"
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
    #  idempotency_headers = SeedIdempotencyHeadersClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  idempotency_headers.payment.create(amount: 1, currency: USD)
    def create(amount:, currency:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
        unless request_options&.idempotency_expiration.nil?
          req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
        end
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), amount: amount, currency: currency }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/payment"
      end
      JSON.parse(response.body)
    end

    # @param payment_id [String]
    # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    # @return [Void]
    # @example
    #  idempotency_headers = SeedIdempotencyHeadersClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  idempotency_headers.payment.delete(payment_id: "paymentId")
    def delete(payment_id:, request_options: nil)
      @request_client.conn.delete do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
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
    #  idempotency_headers = SeedIdempotencyHeadersClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  idempotency_headers.payment.create(amount: 1, currency: USD)
    def create(amount:, currency:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
          unless request_options&.idempotency_expiration.nil?
            req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
          end
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
            amount: amount,
            currency: currency
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/payment"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param payment_id [String]
    # @param request_options [SeedIdempotencyHeadersClient::RequestOptions]
    # @return [Void]
    # @example
    #  idempotency_headers = SeedIdempotencyHeadersClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  idempotency_headers.payment.delete(payment_id: "paymentId")
    def delete(payment_id:, request_options: nil)
      Async do
        @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/payment/#{payment_id}"
        end
      end
    end
  end
end
