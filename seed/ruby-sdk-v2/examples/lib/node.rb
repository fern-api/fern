# frozen_string_literal: true

module Types
    module Types
        class Node < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :nodes, Array, optional: true, nullable: true
            field :trees, Array, optional: true, nullable: true
        end
    end
end
