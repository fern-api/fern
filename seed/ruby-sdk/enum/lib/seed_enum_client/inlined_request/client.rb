# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/operand"
require_relative "../types/color_or_operand"
require "async"

module SeedEnumClient
  class InlinedRequestClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [InlinedRequestClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [Color, Operand]
    # @param maybe_operand_or_color [Color, Operand]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send(operand:, operand_or_color:, maybe_operand: nil, maybe_operand_or_color: nil, request_options: nil)
      @request_client.conn.post("/inlined") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          operand: operand,
          maybeOperand: maybe_operand,
          operandOrColor: operand_or_color,
          maybeOperandOrColor: maybe_operand_or_color
        }.compact
      end
    end
  end

  class AsyncInlinedRequestClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncInlinedRequestClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [Color, Operand]
    # @param maybe_operand_or_color [Color, Operand]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send(operand:, operand_or_color:, maybe_operand: nil, maybe_operand_or_color: nil, request_options: nil)
      Async do
        @request_client.conn.post("/inlined") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            operand: operand,
            maybeOperand: maybe_operand,
            operandOrColor: operand_or_color,
            maybeOperandOrColor: maybe_operand_or_color
          }.compact
        end
      end
    end
  end
end
