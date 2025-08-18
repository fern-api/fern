
module Seed
  module Endpoints
    module Enum
      class Client
        # @option client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::Enum::Client]
        def initialize(client)
          @client = client
        end

        # @return [Seed::Types::Enum::Types::WeatherReport]
        def get_and_return_enum(request_options: {}, **params)
          _request = Seed::Internal::Http::JSONRequest.new(
            method: POST,
            path: "/enum"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Enum::Types::WeatherReport.load(_response.body)
          else
            raise _response.body
          end
        end

      end
    end
  end
end
