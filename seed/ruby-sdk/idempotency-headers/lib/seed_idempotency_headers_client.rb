# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_idempotency_headers_client/payment/client"

module SeedIdempotencyHeadersClient
  class Client
    attr_reader :payment

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          token: token)
      @payment = PaymentClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :payment

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     token: token)
      @payment = AsyncPaymentClient.new(request_client: @async_request_client)
    end
  end
end
