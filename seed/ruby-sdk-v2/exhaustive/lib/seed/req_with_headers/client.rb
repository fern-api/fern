
module Seed
  module ReqWithHeaders
    class Client
      # @return [Seed::ReqWithHeaders::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def get_with_custom_header(request_options: {}, **params)
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
