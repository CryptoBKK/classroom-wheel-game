# 🎡 Classroom Wheel Game

An interactive Wheel of Fortune style game for classroom use. Perfect for grades 1-6, playable with teams or individuals.

## Features

✅ **10 Rounds** - Built-in timer for ~50 minute sessions  
✅ **Flexible Teams** - Support 1-6 teams or individual players  
✅ **8 Pre-loaded Categories** - Animals, Sports, Geography, Food, Movies, Holidays, School, Technology  
✅ **Custom Phrases** - Add your own phrases each round  
✅ **Teacher Controls** - Full game management from one device  
✅ **Score Tracking** - Automatic scoring and final rankings  
✅ **Responsive Design** - Works on projectors, tablets, and displays  

## How to Play

1. **Setup**: Choose number of teams (1-6)
2. **Each Round**: 
   - Select a category or add a custom phrase
   - Teams take turns guessing letters
   - Correct guess = letter revealed, same team continues
   - Wrong guess = team switches to next one
   - First to solve = 100 points
3. **After 10 Rounds**: Final scores displayed

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

### Option 2: GitHub + Vercel Web

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

## Customization

### Add More Categories

Edit `app/page.tsx` and add to the `PHRASES` object:

```typescript
const PHRASES: { [key: string]: string[] } = {
  YourCategory: ['PHRASE ONE', 'PHRASE TWO', 'PHRASE THREE'],
  // ... other categories
};
```

Then add the category name to the `CATEGORIES` array:

```typescript
const CATEGORIES = ['YourCategory', 'Animals', 'Sports', ...];
```

### Change Scoring

In `app/page.tsx`, find this line in the `guessLetter` function:

```typescript
newTeams[gameState.currentTeamIndex].score += 100;
```

Change `100` to any points you want.

### Customize Colors

Edit `app/page.css` and look for these variables:

```css
#667eea   /* Primary purple */
#764ba2   /* Secondary purple */
#4caf50   /* Green (correct) */
#f44336   /* Red (wrong) */
```

## Tips for Teachers

- **Setup a laptop/tablet connected to a projector** for the main display
- **Call on students to guess letters** - keeps everyone engaged
- **Use custom phrases** from your lesson (spelling words, vocabulary, historical events)
- **Mix team play** with individual rounds to keep it fresh
- **Time each round** - suggest 3-5 minutes per phrase so 10 rounds fits 50 minutes

## Browser Support

Works on:
- Chrome/Edge (recommended)
- Safari
- Firefox
- Mobile browsers (for projector display)

## License

Free to use in classrooms!
