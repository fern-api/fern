
module Seed
    module Path
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Path::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::SendResponse]
            def send(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "path/#{params[:id]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
