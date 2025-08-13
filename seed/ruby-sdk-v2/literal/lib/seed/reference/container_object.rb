
module Seed
    module Types
        class ContainerObject < Internal::Types::Model
            field :nested_objects, Internal::Types::Array[Seed::reference::NestedObjectWithLiterals], optional: false, nullable: false
        end
    end
end
