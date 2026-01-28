# frozen_string_literal: true

module FernStreamingParameter
  module Dummy
    class Client
      # @param client [FernStreamingParameter::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernStreamingParameter::Dummy::Types::GenerateRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def generate(request_options: {}, **params)
        params = FernStreamingParameter::Internal::Types::Utils.normalize_keys(params)
        request = FernStreamingParameter::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "generate",
          body: FernStreamingParameter::Dummy::Types::GenerateRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernStreamingParameter::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernStreamingParameter::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
