# frozen_string_literal: true

module Seed
  module Types
    class V2CustomFilesZero < Internal::Types::Model
      field :type, -> { Seed::Types::V2CustomFilesZeroType }, optional: false, nullable: false
    end
  end
end
