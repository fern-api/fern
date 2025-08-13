
module Seed
    module Endpoints
        module Container
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Container::Client]
                def initialize(client)
                    @client = client
                end

                # @return [Array[String]]
                def get_and_return_list_of_primitives(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/list-of-primitives"
                    )
                end

<<<<<<< HEAD
                # @return [Array[Seed::Types::Object_::ObjectWithRequiredField]]
=======
                # @return [Array[Seed::types::object::ObjectWithRequiredField]]
>>>>>>> ca21b06d09 (fix)
                def get_and_return_list_of_objects(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/list-of-objects"
                    )
                end

                # @return [Array[String]]
                def get_and_return_set_of_primitives(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/set-of-primitives"
                    )
                end

<<<<<<< HEAD
                # @return [Array[Seed::Types::Object_::ObjectWithRequiredField]]
=======
                # @return [Array[Seed::types::object::ObjectWithRequiredField]]
>>>>>>> ca21b06d09 (fix)
                def get_and_return_set_of_objects(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/set-of-objects"
                    )
                end

                # @return [Hash[String, String]]
                def get_and_return_map_prim_to_prim(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/map-prim-to-prim"
                    )
                end

<<<<<<< HEAD
                # @return [Hash[String, Seed::Types::Object_::ObjectWithRequiredField]]
=======
                # @return [Hash[String, Seed::types::object::ObjectWithRequiredField]]
>>>>>>> ca21b06d09 (fix)
                def get_and_return_map_of_prim_to_object(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/map-prim-to-object"
                    )
                end

<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithRequiredField | nil]
=======
                # @return [Seed::types::object::ObjectWithRequiredField | nil]
>>>>>>> ca21b06d09 (fix)
                def get_and_return_optional(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/container/opt-objects"
                    )
                end

        end
    end
end
