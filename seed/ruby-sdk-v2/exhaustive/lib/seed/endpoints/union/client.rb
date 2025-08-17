
module Seed
  module Endpoints
    module Union
      class Client
        # @option client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::Union::Client]
        def initialize(client)
          @client = client
        end

        # @return [Seed::Types::Union::Types::Animal]
        def get_and_return_union(request_options: {}, **params)
          _request = Seed::Internal::Http::JSONRequest.new(
            method: POST,
            path: "/union"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Union::Types::Animal.load(_response.body)
          else
            raise _response.body
          end
        end

      end
    end
  end
end
