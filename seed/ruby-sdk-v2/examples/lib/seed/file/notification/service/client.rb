
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

                    # @return [Seed::types::Exception]
                    def get_exception(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/file/notification/#{params[:notificationId]}"
                        )
                    end

            end
        end
    end
end
