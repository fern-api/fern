
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
            # @return [Seed::Service::Resource]
            def get_resource(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::Service::Resource]]
            def list_resources(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::service::Resource]
            def get_resource(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/resource/#{params[:ResourceID]}"
                )
            end

            # @return [Array[Seed::service::Resource]]
            def list_resources(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/resource"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
