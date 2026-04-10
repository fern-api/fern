# frozen_string_literal: true

module Seed
  module Types
    class V2Files < Internal::Types::Model
      field :files, -> { Internal::Types::Array[Seed::Types::V2FileInfoV2] }, optional: false, nullable: false
    end
  end
end
