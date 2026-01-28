# frozen_string_literal: true

module FernStreaming
  module Dummy
    class Client
      # @param client [FernStreaming::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernStreaming::Dummy::Types::GenerateStreamRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def generate_stream(request_options: {}, **params)
        params = FernStreaming::Internal::Types::Utils.normalize_keys(params)
        request = FernStreaming::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "generate-stream",
          body: FernStreaming::Dummy::Types::GenerateStreamRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernStreaming::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernStreaming::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernStreaming::Dummy::Types::Generateequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernStreaming::Dummy::Types::StreamResponse]
      def generate(request_options: {}, **params)
        params = FernStreaming::Internal::Types::Utils.normalize_keys(params)
        request = FernStreaming::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "generate",
          body: FernStreaming::Dummy::Types::Generateequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernStreaming::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernStreaming::Dummy::Types::StreamResponse.load(response.body)
        else
          error_class = FernStreaming::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
