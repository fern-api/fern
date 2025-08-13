
module Seed
    module File
        module Notification
            module Service
                class Client
                    # @option client [Seed::Internal::Http::RawClient]
                    #
                    # @return [Seed::File::Notification::Service::Client]
                    def initialize(client)
                        @client = client
                    end

                    # @return [Seed::types::Exception]
                    def get_exception
                        raise NotImplementedError, 'This method is not yet implemented.'
                    end
                end
            end
        end
    end
end
