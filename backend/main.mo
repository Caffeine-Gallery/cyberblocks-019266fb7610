import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Order "mo:base/Order";

actor {
  // Define the HighScore type
  type HighScore = {
    name: Text;
    score: Nat;
  };

  // Store high scores
  stable var highScores : [HighScore] = [];

  // Add a new high score
  public func addHighScore(name: Text, score: Nat) : async [HighScore] {
    let newScore : HighScore = { name = name; score = score };
    highScores := Array.sort(Array.append<HighScore>(highScores, [newScore]), func(a: HighScore, b: HighScore) : Order.Order {
      if (a.score > b.score) { #less } else if (a.score < b.score) { #greater } else { #equal }
    });
    if (highScores.size() > 10) {
      highScores := Array.tabulate<HighScore>(10, func(i) { highScores[i] });
    };
    highScores
  };

  // Get all high scores
  public query func getHighScores() : async [HighScore] {
    highScores
  };
}
