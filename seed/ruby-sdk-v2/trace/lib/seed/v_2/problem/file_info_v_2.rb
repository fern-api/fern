
module Seed
    module Types
        class FileInfoV2 < Internal::Types::Model
            field :filename, , optional: false, nullable: false
            field :directory, , optional: false, nullable: false
            field :contents, , optional: false, nullable: false
            field :editable, , optional: false, nullable: false
        end
    end
end
