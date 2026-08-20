# frozen_string_literal: true

require "test_helper"

describe "root module collisions" do
  it "loads and instantiates root and same-named service constants" do
    client = Seed::Client.new(base_url: "https://example.com")

    assert_instance_of Seed::Seed::Client, client.seed

    request = Seed::Seed::Types::CreateWidgetRequest.new(
      name: "widget",
      kind: Seed::Seed::Types::CreateWidgetRequestKind::STANDARD
    )

    assert_equal "widget", request.name
    assert_equal "standard", request.kind

    widget = Seed::Types::Widget.new(id: "widget-1", status: Seed::Types::WidgetStatus::ACTIVE)

    assert_equal "widget-1", widget.id
  end
end
