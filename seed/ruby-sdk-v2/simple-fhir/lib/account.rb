# frozen_string_literal: true

module Api
    module Types
        class Account < Internal::Types::Model
            field :resource_type, Array, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :patient, Array, optional: true, nullable: true
            field :practitioner, Array, optional: true, nullable: true
        end
    end
end
