
module Seed
    module Endpoints
        module Container
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Container::Client]
                def initialize(client)
                    @client = client
                end

                # @return [void]
                def get_and_return_list_of_primitives; end

                # @return [void]
                def get_and_return_list_of_objects; end

                # @return [void]
                def get_and_return_set_of_primitives; end

                # @return [void]
                def get_and_return_set_of_objects; end

                # @return [void]
                def get_and_return_map_prim_to_prim; end

                # @return [void]
                def get_and_return_map_of_prim_to_object; end

                # @return [void]
                def get_and_return_optional; end
            end
        end
    end
end
