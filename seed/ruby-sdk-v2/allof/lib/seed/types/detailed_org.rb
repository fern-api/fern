# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class DetailedOrg < Internal::Types::Model
      field :metadata, -> { Seed::Types::DetailedOrgMetadata }, optional: true, nullable: false
    end
  end
end
