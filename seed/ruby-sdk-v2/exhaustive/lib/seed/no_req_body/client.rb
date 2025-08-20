# frozen_string_literal: true

module Seed
  module NoReqBody
    class Client
      # @return [Seed::NoReqBody::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
      def get_with_no_request_body(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
        end

        raise _response.body
      end

      # @return [String]
      def post_with_no_request_body(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
