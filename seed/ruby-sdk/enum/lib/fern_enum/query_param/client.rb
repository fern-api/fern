# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/operand"
require "async"

module SeedEnumClient
  class QueryParamClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [QueryParamClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil, request_options: nil)
      @request_client.conn.post("/query") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "operand": operand,
          "maybeOperand": maybe_operand,
          "operandOrColor": operand_or_color,
          "maybeOperandOrColor": maybe_operand_or_color
        }.compact
      end
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send_list(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil,
                  request_options: nil)
      @request_client.conn.post("/query-list") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "operand": operand,
          "maybeOperand": maybe_operand,
          "operandOrColor": operand_or_color,
          "maybeOperandOrColor": maybe_operand_or_color
        }.compact
      end
    end
  end

  class AsyncQueryParamClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncQueryParamClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil, request_options: nil)
      Async do
        @request_client.conn.post("/query") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "operand": operand,
            "maybeOperand": maybe_operand,
            "operandOrColor": operand_or_color,
            "maybeOperandOrColor": maybe_operand_or_color
          }.compact
        end
      end
    end

    # @param operand [Operand]
    # @param maybe_operand [Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def send_list(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil,
                  request_options: nil)
      Async do
        @request_client.conn.post("/query-list") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "operand": operand,
            "maybeOperand": maybe_operand,
            "operandOrColor": operand_or_color,
            "maybeOperandOrColor": maybe_operand_or_color
          }.compact
        end
      end
    end
  end
end
