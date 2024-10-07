export const idlFactory = ({ IDL }) => {
  const HighScore = IDL.Record({ 'name' : IDL.Text, 'score' : IDL.Nat });
  return IDL.Service({
    'addHighScore' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Vec(HighScore)], []),
    'getHighScores' : IDL.Func([], [IDL.Vec(HighScore)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
