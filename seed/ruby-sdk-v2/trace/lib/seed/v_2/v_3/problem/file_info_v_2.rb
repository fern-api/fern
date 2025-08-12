
module Seed
    module Types
        class FileInfoV2 < Internal::Types::Model
            field :filename, String, optional: false, nullable: false
            field :directory, String, optional: false, nullable: false
            field :contents, String, optional: false, nullable: false
            field :editable, Internal::Types::Boolean, optional: false, nullable: false
        end
    end
end
