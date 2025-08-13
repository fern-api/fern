
module Seed
    module Types
        class WithDocs < Internal::Types::Model
            field :docs, String, optional: false, nullable: false
        end
    end
end
