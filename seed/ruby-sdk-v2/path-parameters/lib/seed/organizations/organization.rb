
module Seed
    module Types
        class Organization < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :tags, Internal::Types::Array[String], optional: false, nullable: false

    end
end
