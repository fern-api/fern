
module Seed
    module Types
        class UsernameContainer < Internal::Types::Model
            field :results, Internal::Types::Array[String], optional: false, nullable: false

    end
end
