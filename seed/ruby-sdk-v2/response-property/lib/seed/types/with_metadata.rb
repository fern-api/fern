
module Seed
    module Types
        class WithMetadata < Internal::Types::Model
            field :metadata, Internal::Types::Hash[String, String], optional: false, nullable: false

    end
end
