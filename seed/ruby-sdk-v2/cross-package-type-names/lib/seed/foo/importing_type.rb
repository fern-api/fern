
module Seed
    module Types
        class ImportingType < Internal::Types::Model
            field :imported, String, optional: false, nullable: false
        end
    end
end
