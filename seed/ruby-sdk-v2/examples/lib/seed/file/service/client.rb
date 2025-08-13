
module Seed
    module File
        module Service
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::File::Service::Client]
                def initialize(client)
                    @client = client
                end

                # This endpoint returns a file by its name.
                #
                # @return [Seed::types::File]
                def get_file(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/file/#{params[:filename]}"
                    )
                end

        end
    end
end
