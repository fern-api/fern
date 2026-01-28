# frozen_string_literal: true

module FernServerSentEventExamples
  module Completions
    class Client
      # @param client [FernServerSentEventExamples::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernServerSentEventExamples::Completions::Types::StreamCompletionRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def stream(request_options: {}, **params)
        params = FernServerSentEventExamples::Internal::Types::Utils.normalize_keys(params)
        request = FernServerSentEventExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "stream",
          body: FernServerSentEventExamples::Completions::Types::StreamCompletionRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernServerSentEventExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernServerSentEventExamples::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
