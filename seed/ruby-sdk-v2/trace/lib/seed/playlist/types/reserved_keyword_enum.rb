# frozen_string_literal: true

require_relative "../.."

module Seed
  module Playlist
    module Types
      module ReservedKeywordEnum
        extend Seed::Internal::Types::Enum

        IS = "is"
        AS = "as"
      end
    end
  end
end
