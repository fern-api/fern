
module Seed
    module Types
        class NamedMetadata < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :value, Internal::Types::Hash[String, Internal::Types::Hash[String, ]], optional: false, nullable: false
        end
    end
end
