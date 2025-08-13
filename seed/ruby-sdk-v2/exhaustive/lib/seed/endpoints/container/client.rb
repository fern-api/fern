
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

                # @return [Array[String]]
                def get_and_return_list_of_primitives
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Array[Seed::types::object::ObjectWithRequiredField]]
                def get_and_return_list_of_objects
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Array[String]]
                def get_and_return_set_of_primitives
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Array[Seed::types::object::ObjectWithRequiredField]]
                def get_and_return_set_of_objects
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Hash[String, String]]
                def get_and_return_map_prim_to_prim
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Hash[String, Seed::types::object::ObjectWithRequiredField]]
                def get_and_return_map_of_prim_to_object
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::types::object::ObjectWithRequiredField | nil]
                def get_and_return_optional
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
