# frozen_string_literal: true

module Seed
  module Headers
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Types::Operand] :operand
      # @option params [Seed::Types::Operand, nil] :maybe_operand
      # @option params [Seed::Types::ColorOrOperand] :operand_or_color
      # @option params [Seed::Types::ColorOrOperand, nil] :maybe_operand_or_color
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        headers = {}
        headers["operand"] = params[:operand] if params[:operand]
        headers["maybeOperand"] = params[:maybe_operand] if params[:maybe_operand]
        headers["operandOrColor"] = params[:operand_or_color] if params[:operand_or_color]
        headers["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params[:maybe_operand_or_color]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "headers",
          headers: headers,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end

module Seed
  module Headers
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Types::Operand] :operand
      # @option params [Seed::Types::Operand, nil] :maybe_operand
      # @option params [Seed::Types::ColorOrOperand] :operand_or_color
      # @option params [Seed::Types::ColorOrOperand, nil] :maybe_operand_or_color
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        headers = {}
        headers["operand"] = params[:operand] if params[:operand]
        headers["maybeOperand"] = params[:maybe_operand] if params[:maybe_operand]
        headers["operandOrColor"] = params[:operand_or_color] if params[:operand_or_color]
        headers["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params[:maybe_operand_or_color]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "headers",
          headers: headers,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
