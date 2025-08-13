
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

<<<<<<< HEAD
                    # @return [Seed::Types::Exception]
                    def get_exception(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Seed::types::Exception]
                    def get_exception(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/file/notification/#{params[:notificationId]}"
                        )
>>>>>>> ca21b06d09 (fix)
                    end

            end
        end
    end
end
