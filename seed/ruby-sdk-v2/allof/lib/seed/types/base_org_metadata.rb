# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class BaseOrgMetadata < Internal::Types::Model
      field :region, -> { String }, optional: false, nullable: false

      field :tier, -> { String }, optional: true, nullable: false
    end
  end
end
