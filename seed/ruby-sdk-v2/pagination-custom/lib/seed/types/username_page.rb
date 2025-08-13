
module Seed
    module Types
        class UsernamePage < Internal::Types::Model
            field :after, String, optional: true, nullable: false
            field :data, Internal::Types::Array[String], optional: false, nullable: false
        end
    end
end
