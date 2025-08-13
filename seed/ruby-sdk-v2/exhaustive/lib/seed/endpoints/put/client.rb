
module Seed
    module Endpoints
        module Put
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Put::Client]
                def initialize(client)
                    @client = client
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Endpoints::Put::PutResponse]
                def add(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                # @return [Seed::endpoints::put::PutResponse]
                def add(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "#{params[:id]}"
                    )
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Endpoints::Put::PutResponse]
                def add(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
                end

        end
    end
end
