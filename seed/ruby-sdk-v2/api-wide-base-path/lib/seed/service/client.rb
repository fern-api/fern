
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
            def post(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/test/#{params[:pathParam]}/#{params[:serviceParam]}/#{params[:endpointParam]}/#{params[:resourceParam]}"
                )
            end

    end
end
