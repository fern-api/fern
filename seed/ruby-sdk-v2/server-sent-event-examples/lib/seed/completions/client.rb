# frozen_string_literal: true

module Seed
  module Completions
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Completions::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Completions::Types::StreamCompletionRequest]
      #
      # @return [untyped]
      def stream(request_options: {}, **params)
        _body_prop_names = %i[query]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "stream",
          body: Seed::Completions::Types::StreamCompletionRequest.new(_body_bag).to_h
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
