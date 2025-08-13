
module Seed
    module Types
        class DefaultProvidedFile < Internal::Types::Model
            field :file, Seed::v_2::v_3::problem::FileInfoV2, optional: false, nullable: false
            field :related_types, Internal::Types::Array[Seed::commons::VariableType], optional: false, nullable: false
        end
    end
end
