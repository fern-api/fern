
module Seed
    module Types
        class Response < Internal::Types::Model
            field :foo, Seed::folder_b::common::Foo, optional: true, nullable: false

    end
end
