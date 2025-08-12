
module Seed
    module NestedNoAuth
        module Api
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::NestedNoAuth::Api::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_something
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
