
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

                # @return [void]
                def get_and_return_with_optional_field; end

                # @return [void]
                def get_and_return_with_required_field; end

                # @return [void]
                def get_and_return_with_map_of_map; end

                # @return [void]
                def get_and_return_nested_with_optional_field; end

                # @return [void]
                def get_and_return_nested_with_required_field; end

                # @return [void]
                def get_and_return_nested_with_required_field_as_list; end
            end
        end
    end
end
