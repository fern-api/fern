# frozen_string_literal: true

module Seed
  module QueryParam
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::QueryParam::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        _query = {}
        _query["operand"] = params[:operand] if params.key?(:operand)
        _query["maybeOperand"] = params[:maybe_operand] if params.key?(:maybe_operand)
        _query["operandOrColor"] = params[:operand_or_color] if params.key?(:operand_or_color)
        _query["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params.key?(:maybe_operand_or_color)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def send_list(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        _query = {}
        _query["operand"] = params[:operand] if params.key?(:operand)
        _query["maybeOperand"] = params[:maybe_operand] if params.key?(:maybe_operand)
        _query["operandOrColor"] = params[:operand_or_color] if params.key?(:operand_or_color)
        _query["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params.key?(:maybe_operand_or_color)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query-list",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
