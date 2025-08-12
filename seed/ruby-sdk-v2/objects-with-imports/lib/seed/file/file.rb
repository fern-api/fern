
module Seed
    module Types
        class File < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :contents, , optional: false, nullable: false
            field :info, , optional: false, nullable: false
        end
    end
end
