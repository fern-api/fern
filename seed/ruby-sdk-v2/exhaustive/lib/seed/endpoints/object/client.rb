
module Seed
    module Endpoints
        module Object_
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Object_::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_and_return_with_optional_field
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_with_required_field
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_with_map_of_map
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_nested_with_optional_field
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_nested_with_required_field
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_nested_with_required_field_as_list
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
