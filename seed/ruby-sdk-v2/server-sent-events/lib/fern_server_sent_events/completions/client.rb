# frozen_string_literal: true

module FernServerSentEvents
  module Completions
    class Client
      # @param client [FernServerSentEvents::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernServerSentEvents::Completions::Types::StreamCompletionRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def stream(request_options: {}, **params)
        params = FernServerSentEvents::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[query]
        body_bag = params.slice(*body_prop_names)

        request = FernServerSentEvents::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "stream",
          body: FernServerSentEvents::Completions::Types::StreamCompletionRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernServerSentEvents::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernServerSentEvents::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
