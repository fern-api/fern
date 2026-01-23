# frozen_string_literal: true

module FernPathParameters
  module Organizations
    module Types
      class GetOrganizationUserRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :organization_id, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
