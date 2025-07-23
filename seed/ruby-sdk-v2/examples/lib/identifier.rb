# frozen_string_literal: true

module Api
    module Types
        class Identifier < Internal::Types::Model
            field :type, Type, optional: true, nullable: true
            field :value, String, optional: true, nullable: true
            field :label, String, optional: true, nullable: true
        end
    end
end
