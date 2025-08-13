
module Seed
    module Endpoints
        module Put
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Put::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Seed::endpoints::put::PutResponse]
                def add(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "#{params[:id]}"
                    )
                end

        end
    end
end
