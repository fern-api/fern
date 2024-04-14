# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_idempotency_headers/payment/client"

module SeedIdempotencyHeadersClient
  class Client
    # @return [SeedIdempotencyHeadersClient::PaymentClient]
    attr_reader :payment

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedIdempotencyHeadersClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedIdempotencyHeadersClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @payment = SeedIdempotencyHeadersClient::PaymentClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedIdempotencyHeadersClient::AsyncPaymentClient]
    attr_reader :payment

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedIdempotencyHeadersClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedIdempotencyHeadersClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @payment = SeedIdempotencyHeadersClient::AsyncPaymentClient.new(request_client: @async_request_client)
    end
  end
end
