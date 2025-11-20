# frozen_string_literal: true

module Seed
  module Inlined
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Inlined::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Inlined::Types::SendLiteralsInlinedRequest]
      #
      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        _body_prop_names = %i[prompt context query temperature stream aliased_context maybe_context object_with_literal]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "inlined",
          body: Seed::Inlined::Types::SendLiteralsInlinedRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
