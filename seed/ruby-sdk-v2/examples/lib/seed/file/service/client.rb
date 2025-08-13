
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
                # @return [Seed::Types::File]
                def get_file(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
