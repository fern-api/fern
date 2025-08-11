# frozen_string_literal: true

module Reference
    module Types
        class ContainerObject < Internal::Types::Model
            field :nested_objects, Array, optional: true, nullable: true
        end
    end
end
