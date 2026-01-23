# frozen_string_literal: true

module FernHttpHead
  module User
    class Client
      # @param client [FernHttpHead::Internal::Http::RawClient]
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
      #
      # @return [untyped]
      def head(request_options: {}, **params)
        FernHttpHead::Internal::Types::Utils.normalize_keys(params)
        request = FernHttpHead::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "HEAD",
          path: "/users",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernHttpHead::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernHttpHead::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :limit
      #
      # @return [Array[FernHttpHead::User::Types::User]]
      def list(request_options: {}, **params)
        params = FernHttpHead::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        params.except(*query_param_names)

        request = FernHttpHead::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernHttpHead::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernHttpHead::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
