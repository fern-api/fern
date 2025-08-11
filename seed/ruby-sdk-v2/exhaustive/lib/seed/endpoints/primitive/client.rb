
module Seed
    module Endpoints
        module Primitive
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Primitive::Client]
                def initialize(client)
                    @client = client
                end

                # @return [void]
                def get_and_return_string; end

                # @return [void]
                def get_and_return_int; end

                # @return [void]
                def get_and_return_long; end

                # @return [void]
                def get_and_return_double; end

                # @return [void]
                def get_and_return_bool; end

                # @return [void]
                def get_and_return_datetime; end

                # @return [void]
                def get_and_return_date; end

                # @return [void]
                def get_and_return_uuid; end

                # @return [void]
                def get_and_return_base_64; end
            end
        end
    end
end
