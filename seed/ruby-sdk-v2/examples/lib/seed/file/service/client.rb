
module Seed
    module File
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::File::Service::Client]
                def initialize(client)
                    @client = client
                end

                # This endpoint returns a file by its name.
                #
<<<<<<< HEAD
                # @return [Seed::Types::File]
                def get_file(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
=======
                # @return [Seed::types::File]
                def get_file(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/file/#{params[:filename]}"
                    )
>>>>>>> ca21b06d09 (fix)
                end

        end
    end
end
