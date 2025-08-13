
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

                # @return [Seed::types::File]
                def get_file
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
