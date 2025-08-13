
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

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
            end

    end
end
