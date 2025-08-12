
module Seed
    module Types
        class Directory < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :files, , optional: true, nullable: false
            field :directories, , optional: true, nullable: false
        end
    end
end
