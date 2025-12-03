# frozen_string_literal: true

module Seed
  module Inlined
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Inlined::Types::SendLiteralsInlinedRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        body_prop_names = %i[prompt context query temperature stream aliased_context maybe_context object_with_literal]
        body_bag = params.slice(*body_prop_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "inlined",
          body: Seed::Inlined::Types::SendLiteralsInlinedRequest.new(body_bag).to_h
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
