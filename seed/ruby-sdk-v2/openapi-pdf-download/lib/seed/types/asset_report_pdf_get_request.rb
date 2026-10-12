# frozen_string_literal: true

module Seed
  module Types
    class AssetReportPdfGetRequest < Internal::Types::Model
      field :asset_report_token, -> { String }, optional: false, nullable: false
    end
  end
end
