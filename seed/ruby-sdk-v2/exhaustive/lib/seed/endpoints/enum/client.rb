
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

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Enum::WeatherReport]
=======
                # @return [Seed::types::enum::WeatherReport]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Enum::WeatherReport]
>>>>>>> 51153df442 (fix)
                def get_and_return_enum(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/enum"
                    )
                end

        end
    end
end
