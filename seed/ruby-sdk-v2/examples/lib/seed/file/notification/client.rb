
module Seed
    module File
        module Notification
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::File::Notification::Client]
                def initialize(client)
                    @client = client
                end
            end
        end
    end
end
