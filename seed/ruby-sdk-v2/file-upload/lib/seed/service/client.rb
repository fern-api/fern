
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def post
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def just_file
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def just_file_with_query_params
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def with_content_type
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def with_form_encoding
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def with_form_encoded_containers
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def optional_args
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def with_inline_type
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def simple
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
