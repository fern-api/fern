# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class OrganizationMetadata < Internal::Types::Model
      field :region, -> { String }, optional: false, nullable: false

      field :domain, -> { String }, optional: true, nullable: false
    end
  end
end
