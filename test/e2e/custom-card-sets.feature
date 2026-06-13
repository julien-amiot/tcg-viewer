# SC-TCG — Custom Card Sets Feature
# Jira Test Case: TCGV-3
# BDD Scenarios for Upload, Save, and Load custom card sets via localStorage

Feature: Custom Card Set Management
  As a user
  I want to upload, save, and switch between custom card sets
  So that I can view my own collections alongside the default SOS set

  Background:
    Given the application is running
    And the default SOS set is loaded

  Scenario Outline: Upload a JSON file and display cards
    When I upload a JSON file containing <cardCount> cards
    Then I should see <cardCount> cards displayed in the grid
    And the card count should show "<cardCount> of <cardCount> cards"

    Examples:
      | cardCount |
      | 1         |
      | 5         |
      | 10        |

  Scenario Outline: Save a custom set with a given name
    When I upload a JSON file containing <cardCount> cards
    And I click the "Save Current Set" button
    And I enter the set name "<setName>"
    Then the set should be saved to localStorage
    And the card count should show "<cardCount> of <cardCount> cards"

    Examples:
      | cardCount | setName        |
      | 1         | My First Set   |
      | 5         | Battle Deck    |
      | 10        | Commander Deck |

  Scenario Outline: Load a saved set from the dropdown
    When I save a custom set named "<setName>" with <cardCount> cards
    And I select "<setName>" from the Set Selector dropdown
    Then I should see <cardCount> cards displayed in the grid
    And the card count should show "<cardCount> of <cardCount> cards"

    Examples:
      | setName        | cardCount |
      | My First Set   | 1         |
      | Battle Deck    | 5         |
      | Commander Deck | 10        |

  Scenario Outline: Switch between saved sets
    When I save a custom set named "<setName1>" with <cardCount1> cards
    And I save another custom set named "<setName2>" with <cardCount2> cards
    And I select "<setName1>" from the Set Selector dropdown
    Then I should see <cardCount1> cards displayed in the grid
    And when I select "<setName2>" from the Set Selector dropdown
    Then I should see <cardCount2> cards displayed in the grid

    Examples:
      | setName1       | cardCount1 | setName2       | cardCount2 |
      | Deck A         | 3          | Deck B         | 7          |
      | Red Deck       | 5          | Blue Deck      | 8          |
      | Commander 1    | 10         | Commander 2    | 12         |

  Scenario: Clear all filters resets the view to full set
    When I apply some filter criteria (search, color, type, rarity)
    And I click the "Clear All Filters" button
    Then all filters should be reset to their default values
    And all cards in the saved set should be displayed