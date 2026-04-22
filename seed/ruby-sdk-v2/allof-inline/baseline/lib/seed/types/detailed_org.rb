# frozen_string_literal: true

module Seed
  module Types
    class DetailedOrg < Internal::Types::Model
      field :metadata, -> { Seed::Types::DetailedOrgMetadata }, optional: true, nullable: false
    end
  end
end
