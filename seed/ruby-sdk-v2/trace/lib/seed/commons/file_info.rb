
module Seed
    module Types
        class FileInfo < Internal::Types::Model
            field :filename, , optional: false, nullable: false
            field :contents, , optional: false, nullable: false
        end
    end
end
