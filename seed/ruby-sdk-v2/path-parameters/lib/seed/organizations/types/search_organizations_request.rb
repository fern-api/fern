# frozen_string_literal: true

module Seed
  module Organizations
    module Types
      class SearchOrganizationsRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :organization_id, -> { String }, optional: false, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
