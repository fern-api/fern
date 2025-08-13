
module Seed
    module Sysprop
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Sysprop::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def set_num_warm_instances(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Hash[Seed::Commons::Language, Integer]]
            def get_num_warm_instances(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PUT,
                    path: "/sysprop/num-warm-instances/#{params[:language]}/#{params[:numWarmInstances]}"
                )
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [Hash[Seed::Commons::Language, Integer]]
            def get_num_warm_instances(request_options: {}, **params)
<<<<<<< HEAD
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/sysprop/num-warm-instances"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
