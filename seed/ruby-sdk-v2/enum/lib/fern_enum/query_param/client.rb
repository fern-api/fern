# frozen_string_literal: true

module FernEnum
  module QueryParam
    class Client
      # @param client [FernEnum::Internal::Http::RawClient]
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
      # @option params [FernEnum::Types::Operand] :operand
      # @option params [FernEnum::Types::Operand, nil] :maybe_operand
      # @option params [FernEnum::Types::ColorOrOperand] :operand_or_color
      # @option params [FernEnum::Types::ColorOrOperand, nil] :maybe_operand_or_color
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        params = FernEnum::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        query_params = {}
        query_params["operand"] = params[:operand] if params.key?(:operand)
        query_params["maybeOperand"] = params[:maybe_operand] if params.key?(:maybe_operand)
        query_params["operandOrColor"] = params[:operand_or_color] if params.key?(:operand_or_color)
        query_params["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params.key?(:maybe_operand_or_color)
        params.except(*query_param_names)

        request = FernEnum::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernEnum::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernEnum::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernEnum::Types::Operand] :operand
      # @option params [FernEnum::Types::Operand, nil] :maybe_operand
      # @option params [FernEnum::Types::ColorOrOperand] :operand_or_color
      # @option params [FernEnum::Types::ColorOrOperand, nil] :maybe_operand_or_color
      #
      # @return [untyped]
      def send_list(request_options: {}, **params)
        params = FernEnum::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        query_params = {}
        query_params["operand"] = params[:operand] if params.key?(:operand)
        query_params["maybeOperand"] = params[:maybe_operand] if params.key?(:maybe_operand)
        query_params["operandOrColor"] = params[:operand_or_color] if params.key?(:operand_or_color)
        query_params["maybeOperandOrColor"] = params[:maybe_operand_or_color] if params.key?(:maybe_operand_or_color)
        params.except(*query_param_names)

        request = FernEnum::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query-list",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernEnum::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernEnum::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
