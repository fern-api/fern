
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
        else
          raise _response.body
        end
      end

      # @return [String]
      def post_with_no_request_body(request_options: {}, **params)
        _request = params
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

    end
  end
end
