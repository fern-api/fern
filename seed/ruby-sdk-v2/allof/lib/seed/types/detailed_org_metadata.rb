# frozen_string_literal: true

module Seed
  module Types
    class DetailedOrgMetadata < Internal::Types::Model
      field :region, -> { String }, optional: false, nullable: false

      field :domain, -> { String }, optional: true, nullable: false
    end
  end
end
