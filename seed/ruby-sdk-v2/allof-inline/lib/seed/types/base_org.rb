# frozen_string_literal: true

module Seed
  module Types
    class BaseOrg < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :metadata, -> { Seed::Types::BaseOrgMetadata }, optional: true, nullable: false
    end
  end
end
