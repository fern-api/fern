# frozen_string_literal: true

module Types
    module Types
        class Entity < Internal::Types::Model
            field :type, Type, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
