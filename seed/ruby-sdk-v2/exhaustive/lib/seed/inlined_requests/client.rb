
module Seed
  module InlinedRequests
    class Client
      # @option client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::InlinedRequests::Client]
      def initialize(client)
        @client = client
      end

      # POST with custom object in request body, response is an object
      #
      # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
      def post_with_object_bodyand_response(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
