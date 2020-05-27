require 'minitest/autorun'
require_relative "../framework.rb"

class TestHome < Minitest::Test
  def test_home
    title = E2ETests.run do |browser|
      browser.navigate.to 'https://doc.wirecard.com'
      browser.title
    end
    assert_equal('Home - Wirecard Documentation', title)
  end
end
