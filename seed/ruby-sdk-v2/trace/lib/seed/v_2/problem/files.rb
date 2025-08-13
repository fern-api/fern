
module Seed
    module Types
        class Files < Internal::Types::Model
            field :files, Internal::Types::Array[Seed::v_2::problem::FileInfoV2], optional: false, nullable: false
        end
    end
end
