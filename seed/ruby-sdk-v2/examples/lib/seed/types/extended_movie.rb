
module Seed
    module Types
        class ExtendedMovie < Internal::Types::Model
            field :cast, Internal::Types::Array[String], optional: false, nullable: false
        end
    end
end
