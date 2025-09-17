# frozen_string_literal: true

module Seed
  module QueryParam
    class Client
      # @return [Seed::QueryParam::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def send_(request_options: {}, **params)
        _query_param_names = [
          %w[operand maybeOperand operandOrColor maybeOperandOrColor],
          %i[operand maybeOperand operandOrColor maybeOperandOrColor]
        ].flatten
        _query = params.slice(*_query_param_names)
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

      # @return [untyped]
      def send_list(request_options: {}, **params)
        _query_param_names = [
          %w[operand maybeOperand operandOrColor maybeOperandOrColor],
          %i[operand maybeOperand operandOrColor maybeOperandOrColor]
        ].flatten
        _query = params.slice(*_query_param_names)
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
