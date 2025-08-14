
module Seed
    module File
        module Notification
            module Service
                class Client
                    # @option client [Seed::Internal::Http::RawClient]
                    #
                    # @return [Seed::File::Notification::Service::Client]
                    def initialize(client)
                        @client = client
                    end

                    # @return [Seed::Types::Exception]
                    def get_exception(request_options: {}, **params)
                        _request = params

                        _response = @client.send(_request)
                        if _response.code >= "200" && _response.code < "300"
                            return Seed::Types::Types::Exception.load(_response.body)

                        else
                            raise _response.body
                    end

            end
        end
    end
end
