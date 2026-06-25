'use client';

import { useState, useEffect } from 'react';
import './page.css';

// Sound effects using Web Audio API
const playSound = (type: 'correct' | 'wrong' | 'reveal' | 'win') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    if (type === 'correct') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'wrong') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(200, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'reveal') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      const frequencies = [523, 659, 784, 1047];
      frequencies.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.setValueAtTime(0, now + idx * 0.15 + 0.3);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.3);
      });
    }
  } catch (e) {
    // Audio context not available
  }
};

interface Team {
  name: string;
  score: number;
}

interface GameState {
  currentRound: number;
  phrase: string;
  category: string;
  revealedLetters: Set<string>;
  guessedWrong: Set<string>;
  teams: Team[];
  currentTeamIndex: number;
  gameStarted: boolean;
  gameMode: 'setup' | 'category' | 'playing' | 'roundEnd' | 'gameEnd';
  numTeams: number;
  showGuessDialog: boolean;
  guessInput: string;
}

const CATEGORIES = [
  'Animals', 'Sports', 'Geography', 'Food', 'Movies',
  'Holidays', 'School', 'Technology', 'Weather', 'Ocean',
  'Dinosaurs', 'Superheroes', 'Fairy Tales', 'Planets', 'Music',
  'Vehicles', 'Nature', 'Colors', 'Shapes', 'Emotions'
];

const PHRASES: { [key: string]: string[] } = {
  Animals: ['ELEPHANT IN THE ROOM', 'WILD GOOSE CHASE', 'SLEEPING LIKE A PUPPY', 'BUSY AS A BEE', 'SWIMMING WITH FISH'],
  Sports: ['TOUCHDOWN FOOTBALL', 'HOME RUN BASEBALL', 'SOCCER GOALS', 'BASKETBALL COURT', 'TENNIS MATCH'],
  Geography: ['STATUE OF LIBERTY', 'GREAT WALL OF CHINA', 'PYRAMID OF EGYPT', 'AMAZON RAINFOREST', 'ROCKY MOUNTAINS'],
  Food: ['CHOCOLATE CAKE', 'PIZZA NIGHT', 'ICE CREAM SUNDAE', 'APPLE PIE', 'CHEESE BURGER'],
  Movies: ['FROZEN ADVENTURE', 'LION KING MOVIE', 'TOY STORY', 'FINDING NEMO', 'ALADDIN MAGIC'],
  Holidays: ['CHRISTMAS LIGHTS', 'HALLOWEEN COSTUME', 'EASTER BUNNY', 'BIRTHDAY PARTY', 'NEW YEAR COUNTDOWN'],
  School: ['SCIENCE EXPERIMENT', 'RECESS TIME', 'CLASSROOM RULES', 'PENCIL AND PAPER', 'TEACHER GRADING'],
  Technology: ['VIDEO GAME', 'COMPUTER SCREEN', 'MOBILE PHONE', 'INTERNET CONNECTION', 'ROBOT HELPER'],
  Weather: ['RAIN AND THUNDER', 'SUNNY BEACH DAY', 'SNOW FALLING', 'HURRICANE WIND', 'RAINBOW COLORS'],
  Ocean: ['SWIMMING DOLPHINS', 'GREAT WHITE SHARK', 'OCEAN WAVES', 'STARFISH SAND', 'WHALE WATCHING'],
  Dinosaurs: ['TYRANNOSAURUS REX', 'STEGOSAURUS PLATES', 'TRICERATOPS HORNS', 'PTERODACTYL FLYING', 'VELOCIRAPTOR HUNT'],
  Superheroes: ['BATMAN CAVE', 'SPIDER MAN WEB', 'IRON MAN SUIT', 'SUPERMAN FLYING', 'WONDER WOMAN LASSO'],
  'Fairy Tales': ['CINDERELLA PRINCE', 'SNOW WHITE APPLE', 'RAPUNZEL TOWER', 'PINOCCHIO NOSE', 'SLEEPING BEAUTY'],
  Planets: ['PLANET MARS', 'SATURN RINGS', 'JUPITER LARGE', 'VENUS HOT', 'MERCURY SMALL'],
  Music: ['PIANO KEYS', 'GUITAR STRINGS', 'TRUMPET SOUND', 'DRUM BEAT', 'VIOLIN BOW'],
  Vehicles: ['AIRPLANE FLYING', 'TRAIN TRACKS', 'SUBMARINE DIVING', 'ROCKET LAUNCH', 'BICYCLE PEDAL'],
  Nature: ['MOUNTAIN PEAK', 'FOREST TREES', 'DESERT SAND', 'WATERFALL CASCADE', 'FLOWER BLOOM'],
  Colors: ['RED APPLE', 'BLUE SKY', 'GREEN GRASS', 'YELLOW SUN', 'PURPLE GRAPES'],
  Shapes: ['ROUND CIRCLE', 'SQUARE CORNER', 'TRIANGLE POINT', 'RECTANGLE SIDES', 'STAR BRIGHT'],
  Emotions: ['HAPPY SMILE', 'SAD TEARS', 'ANGRY FACE', 'SCARED SCREAM', 'EXCITED JUMPING'],
};

export default function WheelGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    phrase: '',
    category: '',
    revealedLetters: new Set(),
    guessedWrong: new Set(),
    teams: [],
    currentTeamIndex: 0,
    gameStarted: false,
    gameMode: 'setup',
    numTeams: 1,
    showGuessDialog: false,
    guessInput: '',
  });

  const [customPhrase, setCustomPhrase] = useState('');

  const startGame = (numTeams: number) => {
    const newTeams = Array.from({ length: numTeams }, (_, i) => ({
      name: `Team ${i + 1}`,
      score: 0,
    }));
    setGameState(prev => ({
      ...prev,
      numTeams,
      teams: newTeams,
      gameStarted: true,
      gameMode: 'category',
    }));
  };

  const selectCategory = (category: string) => {
    const phrases = PHRASES[category];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    setGameState(prev => ({
      ...prev,
      category,
      phrase,
      revealedLetters: new Set(),
      guessedWrong: new Set(),
      gameMode: 'playing',
    }));
  };

  const guessLetter = (letter: string) => {
    const upperLetter = letter.toUpperCase();

    if (gameState.revealedLetters.has(upperLetter) || gameState.guessedWrong.has(upperLetter)) {
      return;
    }

    if (gameState.phrase.includes(upperLetter)) {
      // Correct guess
      playSound('correct');
      const newRevealed = new Set(gameState.revealedLetters);
      newRevealed.add(upperLetter);
      setGameState(prev => ({
        ...prev,
        revealedLetters: newRevealed,
      }));

      // Check if phrase is complete
      if (isPhraseSolved(gameState.phrase, newRevealed)) {
        setTimeout(() => {
          playSound('win');
          const newTeams = [...gameState.teams];
          newTeams[gameState.currentTeamIndex].score += 100;
          setGameState(prev => ({
            ...prev,
            teams: newTeams,
            gameMode: 'roundEnd',
          }));
        }, 500);
      }
    } else {
      // Wrong guess
      playSound('wrong');
      const newWrong = new Set(gameState.guessedWrong);
      newWrong.add(upperLetter);
      const newTeams = [...gameState.teams];
      const nextTeamIndex = (gameState.currentTeamIndex + 1) % gameState.numTeams;

      setGameState(prev => ({
        ...prev,
        guessedWrong: newWrong,
        currentTeamIndex: nextTeamIndex,
      }));
    }
  };

  const isPhraseSolved = (phrase: string, revealed: Set<string>) => {
    return phrase
      .split('')
      .filter(char => char !== ' ')
      .every(char => revealed.has(char));
  };

  const submitGuess = () => {
    const userGuess = gameState.guessInput.toUpperCase().trim();

    if (userGuess === gameState.phrase) {
      playSound('win');
      const newTeams = [...gameState.teams];
      newTeams[gameState.currentTeamIndex].score += 150;
      setGameState(prev => ({
        ...prev,
        teams: newTeams,
        gameMode: 'roundEnd',
        showGuessDialog: false,
        guessInput: '',
      }));
    } else {
      playSound('wrong');
      const newTeams = [...gameState.teams];
      const nextTeamIndex = (gameState.currentTeamIndex + 1) % gameState.numTeams;
      setGameState(prev => ({
        ...prev,
        guessedWrong: new Set(prev.guessedWrong).add(`GUESS_${prev.currentTeamIndex}`),
        currentTeamIndex: nextTeamIndex,
        showGuessDialog: false,
        guessInput: '',
      }));
    }
  };

  const nextRound = () => {
    if (gameState.currentRound < 10) {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        gameMode: 'category',
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        gameMode: 'gameEnd',
      }));
    }
  };

  const restartGame = () => {
    setGameState({
      currentRound: 1,
      phrase: '',
      category: '',
      revealedLetters: new Set(),
      guessedWrong: new Set(),
      teams: [],
      currentTeamIndex: 0,
      gameStarted: false,
      gameMode: 'setup',
      numTeams: 1,
      showGuessDialog: false,
      guessInput: '',
    });
    setCustomPhrase('');
  };

  const updateTeamName = (index: number, name: string) => {
    const newTeams = [...gameState.teams];
    newTeams[index].name = name;
    setGameState(prev => ({
      ...prev,
      teams: newTeams,
    }));
  };

  // Setup screen
  if (gameState.gameMode === 'setup') {
    return (
      <div className="screen setup-screen">
        <h1>🎡 Classroom Wheel Game</h1>
        <p>Wheel of Fortune Style - 10 Rounds</p>

        <div className="setup-form">
          <label>Number of Teams/Players:</label>
          <select
            value={gameState.numTeams}
            onChange={(e) => setGameState(prev => ({ ...prev, numTeams: parseInt(e.target.value) }))}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={() => startGame(gameState.numTeams)}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Category selection screen
  if (gameState.gameMode === 'category') {
    return (
      <div className="screen category-screen">
        <h1>Round {gameState.currentRound} of 10</h1>
        <h2>Choose a Category</h2>

        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className="btn-category"
              onClick={() => selectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="custom-phrase">
          <label>Or add custom phrase:</label>
          <input
            type="text"
            placeholder="Enter phrase (all caps)"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value.toUpperCase())}
          />
          <button
            className="btn-secondary"
            onClick={() => {
              if (customPhrase.length > 0) {
                setGameState(prev => ({
                  ...prev,
                  phrase: customPhrase,
                  category: 'Custom',
                  revealedLetters: new Set(),
                  guessedWrong: new Set(),
                  gameMode: 'playing',
                }));
                setCustomPhrase('');
              }
            }}
          >
            Use Custom
          </button>
        </div>

        <div className="scores">
          {gameState.teams.map((team, i) => (
            <div key={i} className={`score-item ${i === gameState.currentTeamIndex ? 'active' : ''}`}>
              {team.name}: {team.score}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState.gameMode === 'playing') {
    const displayPhrase = gameState.phrase
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        return gameState.revealedLetters.has(char) ? char : '_';
      })
      .join('');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
      <div className="screen playing-screen">
        <div className="header">
          <h1>🎡 Round {gameState.currentRound} of 10</h1>
          <p className="category">📂 <strong>{gameState.category}</strong></p>
          <p className="current-team">🎯 {gameState.teams[gameState.currentTeamIndex].name}'s Turn</p>
        </div>

        <div className="phrase-display-container">
          <div className="phrase-display">
            <div className="phrase-letters">
              {gameState.phrase.split('').map((char, idx) => (
                <div key={idx} className={`letter-tile ${char === ' ' ? 'space' : ''}`}>
                  {char === ' ' ? '' : gameState.revealedLetters.has(char) ? char : '_'}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="guessing-section">
          <h3>🔤 Guess a Letter:</h3>
          <div className="alphabet-grid">
            {alphabet.map(letter => {
              const isRevealed = gameState.revealedLetters.has(letter);
              const isWrong = gameState.guessedWrong.has(letter);
              const isDisabled = isRevealed || isWrong;

              return (
                <button
                  key={letter}
                  className={`letter-btn ${isRevealed ? 'correct' : isWrong ? 'wrong' : ''}`}
                  onClick={() => guessLetter(letter)}
                  disabled={isDisabled}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <button
            className="btn-guess-answer"
            onClick={() => setGameState(prev => ({ ...prev, showGuessDialog: true }))}
          >
            💡 Guess the Answer
          </button>
        </div>

        {gameState.showGuessDialog && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <h2>Guess the Phrase</h2>
              <input
                type="text"
                placeholder="Enter your guess..."
                value={gameState.guessInput}
                onChange={(e) => setGameState(prev => ({ ...prev, guessInput: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                autoFocus
              />
              <div className="modal-buttons">
                <button className="btn-primary" onClick={submitGuess}>Submit</button>
                <button className="btn-secondary" onClick={() => setGameState(prev => ({ ...prev, showGuessDialog: false, guessInput: '' }))}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="scores">
          {gameState.teams.map((team, i) => (
            <div key={i} className={`score-item ${i === gameState.currentTeamIndex ? 'active' : ''}`}>
              <span className="team-badge">{i + 1}</span>
              <span className="team-name">{team.name}</span>
              <span className="team-score">{team.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Round end screen
  if (gameState.gameMode === 'roundEnd') {
    return (
      <div className="screen round-end-screen">
        <h1>Round {gameState.currentRound} Complete!</h1>
        <p className="phrase">The phrase was: <strong>{gameState.phrase}</strong></p>
        <p className="winner">🎉 {gameState.teams[gameState.currentTeamIndex].name} scored 100 points!</p>

        <div className="scores">
          {gameState.teams.map((team, i) => (
            <div key={i} className={`score-item ${i === gameState.currentTeamIndex ? 'active' : ''}`}>
              {team.name}: {team.score}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={nextRound}>
          {gameState.currentRound < 10 ? 'Next Round' : 'See Final Scores'}
        </button>
      </div>
    );
  }

  // Game end screen
  if (gameState.gameMode === 'gameEnd') {
    const winner = gameState.teams.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    return (
      <div className="screen game-end-screen">
        <h1>🏆 Game Over!</h1>
        <h2>Final Scores</h2>

        <div className="final-scores">
          {gameState.teams
            .sort((a, b) => b.score - a.score)
            .map((team, i) => (
              <div key={i} className={`final-score-item ${team.name === winner.name ? 'winner' : ''}`}>
                <span className="rank">#{i + 1}</span>
                <span className="name">{team.name}</span>
                <span className="score">{team.score} pts</span>
              </div>
            ))}
        </div>

        <h2 className="winner-text">🎉 {winner.name} wins! 🎉</h2>

        <button className="btn-primary" onClick={restartGame}>
          Play Again
        </button>
      </div>
    );
  }
}
