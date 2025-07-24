# frozen_string_literal: true

module User
    module Types
        class Metadata < Internal::Types::Model
            field :id, Id, optional: true, nullable: true
            field :value, Object, optional: true, nullable: true
        end
    end
end
