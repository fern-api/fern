# frozen_string_literal: true

module Seed
  module Types
    class V2V3CustomFilesType < Internal::Types::Model
      field :type, -> { Seed::Types::V2V3CustomFilesTypeType }, optional: false, nullable: false
      field :value, -> { Internal::Types::Hash[String, Seed::Types::V2V3Files] }, optional: true, nullable: false
    end
  end
end
