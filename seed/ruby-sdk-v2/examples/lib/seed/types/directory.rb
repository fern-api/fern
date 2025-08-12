
module Seed
    module Types
        class Directory < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :files, Internal::Types::Array[Seed::types::File], optional: true, nullable: false
            field :directories, Internal::Types::Array[Seed::types::Directory], optional: true, nullable: false
        end
    end
end
