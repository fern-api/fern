# frozen_string_literal: true

module FernOptional
  module Optional
    class Client
      # @param client [FernOptional::Internal::Http::RawClient]
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
      # @return [String]
      def send_optional_body(request_options: {}, **params)
        params = FernOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "send-optional-body",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def send_optional_typed_body(request_options: {}, **params)
        params = FernOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "send-optional-typed-body",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Tests optional(nullable(T)) where T has only optional properties.
      # This should not generate wire tests expecting {} when Optional.empty() is passed.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :action_id
      # @option params [String] :id
      #
      # @return [FernOptional::Optional::Types::DeployResponse]
      def send_optional_nullable_with_all_optional_properties(request_options: {}, **params)
        params = FernOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "deploy/#{params[:action_id]}/versions/#{params[:id]}",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernOptional::Optional::Types::DeployResponse.load(response.body)
        else
          error_class = FernOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
