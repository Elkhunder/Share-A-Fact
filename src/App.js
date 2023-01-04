import { useEffect, useState } from 'react';
import supabase from './supabase';
import './style.css';

const CATEGORIES = [
  { name: 'technology', color: '#3b82f6' },
  { name: 'science', color: '#16a34a' },
  { name: 'finance', color: '#ef4444' },
  { name: 'society', color: '#eab308' },
  { name: 'entertainment', color: '#db2777' },
  { name: 'health', color: '#14b8a6' },
  { name: 'history', color: '#f97316' },
  { name: 'news', color: '#8b5cf6' },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from('facts').select('*');

        if (currentCategory !== 'all') query = query.eq('category', currentCategory);

        const { data: facts, error } = await query
          .order('votesInteresting', { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert('There was a problem loading data');
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory],
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? <NewFactForm setShowForm={setShowForm} setFacts={setFacts} /> : null}
      <main className='main'>
        <CategoryFilters setCurrentCategory={setCurrentCategory} />
        {isLoading ? <Loader /> : <FactsList facts={facts} setFacts={setFacts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className='message'>Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = 'Today I Learned';
  return (
    <header className='header'>
      <div className='logo'>
        <img src='logo.png' height='68' width='68' alt={appTitle + ' logo'} />
        <h1>{appTitle}</h1>
      </div>

      <button
        className='btn btn-large btn-open'
        onClick={() => {
          setShowForm((show) => !show);
        }}
      >
        {showForm ? 'Close' : 'Share a fact'}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({ setShowForm, setFacts }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(event) {
    // Prevent browser reload
    event.preventDefault();
    console.log(text, source, category);

    // Check if data is valid. If so, create new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200)
      console.log('there is valid data');

    // Upload fact to database and receive the uploaded fact
    setIsUploading(true);
    const { data: newFact, error } = await supabase
      .from('facts')
      .insert([
        {
          text,
          source,
          category,
        },
      ])
      .select()
      .limit(1000);
    setIsUploading(false);
    // Add the new fact to the UI: add the fact to the state
    if (!error) setFacts((facts) => [...facts, newFact[0]]);
    else alert('There was a problem adding your fact');
    // Reset input fields
    setText('');
    setSource('');
    setCategory('');
    // Close the form
    setShowForm((show) => !show);
  }

  return (
    <form className='fact-form' onSubmit={handleSubmit}>
      <input
        type='text'
        placeholder='Share a fact with the world...'
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type='text'
        placeholder='Trustworthy source...'
        value={source}
        onChange={(event) => setSource(event.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value=''>Choose category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className='btn btn-large' disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilters({ setCurrentCategory }) {
  return (
    <aside>
      <ul className='category-filters'>
        <li className='category'>
          <button className='btn btn-all-categories' onClick={() => setCurrentCategory('all')}>
            All
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <li className='category' key={category.name}>
            <button
              className='btn btn-category'
              style={{ backgroundColor: category.color }}
              onClick={() => setCurrentCategory(category.name)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactsList({ facts, setFacts }) {
  if (facts.length === 0) {
    return <p className='message'>No facts for this category yet! Create the first one 😎</p>;
  }

  return (
    <section>
      <ul className='facts-list'>
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesInteresting + fact.votesMindBlowing < fact.votesFalse;
  async function handleVote(voteType) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from('facts')
      .update({ [voteType]: fact[voteType] + 1 })
      .eq('id', fact.id)
      .select();
    setIsUpdating(false);
    console.log(updatedFact);
    if (!error) setFacts((facts) => facts.map((f) => (f.id === fact.id ? updatedFact[0] : f)));
  }
  return (
    <li className='fact'>
      <p>
        {isDisputed ? <span className='disputed'>[⛔️DISPUTED]</span> : null}
        {fact.text}
        <a className='source' href={fact.source} target='_blank' rel='noreferrer'>
          (Source)
        </a>
      </p>
      <span
        className='tag'
        style={{
          backgroundColor: CATEGORIES.find((category) => category.name === fact.category).color,
        }}
      >
        {fact.category}
      </span>
      <div className='vote-buttons'>
        <button disabled={isUpdating} onClick={() => handleVote('votesInteresting')}>
          👍 {fact.votesInteresting}
        </button>
        <button disabled={isUpdating} onClick={() => handleVote('votesMindBlowing')}>
          🤯 {fact.votesMindBlowing}
        </button>
        <button disabled={isUpdating} onClick={() => handleVote('votesFalse')}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
