# frozen_string_literal: true

module Seed
  module Types
    class V2V3CustomFilesZero < Internal::Types::Model
      field :type, -> { Seed::Types::V2V3CustomFilesZeroType }, optional: false, nullable: false
    end
  end
end
