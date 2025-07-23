# frozen_string_literal: true

module Organization
    module Types
        class CreateOrganizationRequest < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
