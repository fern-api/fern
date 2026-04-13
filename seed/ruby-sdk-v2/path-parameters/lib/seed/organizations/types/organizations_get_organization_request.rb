# frozen_string_literal: true

module Seed
  module Organizations
    module Types
      class OrganizationsGetOrganizationRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :organization_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
