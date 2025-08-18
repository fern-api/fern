
module Seed
  module NoAuth
    class Client
      # @option client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::NoAuth::Client]
      def initialize(client)
        @client = client
      end

      # POST request with no auth
      #
      # @return [bool]
      def post_with_no_auth(request_options: {}, **params)
        _request = Seed::Internal::Http::JSONRequest.new(
          method: POST,
          path: "/no-auth",
          body: params[:request],
        )
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
