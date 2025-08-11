# frozen_string_literal: true

module User
    module Types
        class Event < Internal::Types::Model
            field :id, Id, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
