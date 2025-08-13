
module Seed
    module Endpoints
        module Object_
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Object_::Client]
                def initialize(client)
                    @client = client
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithOptionalField]
=======
                # @return [Seed::types::object::ObjectWithOptionalField]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::ObjectWithOptionalField]
>>>>>>> 51153df442 (fix)
                def get_and_return_with_optional_field(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-with-optional-field"
                    )
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithRequiredField]
=======
                # @return [Seed::types::object::ObjectWithRequiredField]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::ObjectWithRequiredField]
>>>>>>> 51153df442 (fix)
                def get_and_return_with_required_field(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-with-required-field"
                    )
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::ObjectWithMapOfMap]
=======
                # @return [Seed::types::object::ObjectWithMapOfMap]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::ObjectWithMapOfMap]
>>>>>>> 51153df442 (fix)
                def get_and_return_with_map_of_map(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-with-map-of-map"
                    )
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::NestedObjectWithOptionalField]
=======
                # @return [Seed::types::object::NestedObjectWithOptionalField]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::NestedObjectWithOptionalField]
>>>>>>> 51153df442 (fix)
                def get_and_return_nested_with_optional_field(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-nested-with-optional-field"
                    )
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::NestedObjectWithRequiredField]
=======
                # @return [Seed::types::object::NestedObjectWithRequiredField]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::NestedObjectWithRequiredField]
>>>>>>> 51153df442 (fix)
                def get_and_return_nested_with_required_field(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-nested-with-required-field/#{params[:string]}"
                    )
                end

<<<<<<< HEAD
<<<<<<< HEAD
                # @return [Seed::Types::Object_::NestedObjectWithRequiredField]
=======
                # @return [Seed::types::object::NestedObjectWithRequiredField]
>>>>>>> ca21b06d09 (fix)
=======
                # @return [Seed::Types::Object_::NestedObjectWithRequiredField]
>>>>>>> 51153df442 (fix)
                def get_and_return_nested_with_required_field_as_list(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/object/get-and-return-nested-with-required-field-list"
                    )
                end

        end
    end
end
